/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// Dependencies
	__webpack_require__(1);
	__webpack_require__(44);

	// Global vars and functions
	__webpack_require__(45);

	// Network components
	__webpack_require__(54);
	__webpack_require__(56);

	// Other components
	__webpack_require__(60);
	__webpack_require__(61);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var templateString = __webpack_require__(2);

	var debug = AFRAME.utils.debug;
	var extend = AFRAME.utils.extend;
	var templateCache = {}; // Template cache.
	var error = debug('template-component:error');
	var log = debug('template-component:info');

	var HANDLEBARS = 'handlebars';
	var JADE = 'jade';
	var MUSTACHE = 'mustache';
	var NUNJUCKS = 'nunjucks';
	var HTML = 'html';

	var LIB_LOADED = {};
	LIB_LOADED[HANDLEBARS] = !!window.Handlebars;
	LIB_LOADED[JADE] = !!window.jade;
	LIB_LOADED[MUSTACHE] = !!window.Mustache;
	LIB_LOADED[NUNJUCKS] = !!window.nunjucks;

	var LIB_SRC = {};
	LIB_SRC[HANDLEBARS] = 'https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.5/handlebars.min.js';
	LIB_SRC[JADE] = 'https://cdnjs.cloudflare.com/ajax/libs/jade/1.11.0/jade.min.js';
	LIB_SRC[MUSTACHE] = 'https://cdnjs.cloudflare.com/ajax/libs/mustache.js/2.2.1/mustache.min.js';
	LIB_SRC[NUNJUCKS] = 'https://cdnjs.cloudflare.com/ajax/libs/nunjucks/2.3.0/nunjucks.min.js';

	AFRAME.registerComponent('template', {
	  schema: {
	    insert: {
	      // insertAdjacentHTML.
	      default: 'beforeend'
	    },
	    type: {
	      default: ''
	    },
	    src: {
	      // Selector or URL.
	      default: ''
	    },
	    data: {
	      default: ''
	    }
	  },

	  update: function update(oldData) {
	    var data = this.data;
	    var el = this.el;
	    var fetcher = data.src[0] === '#' ? fetchTemplateFromScriptTag : fetchTemplateFromXHR;
	    var templateCacheItem = templateCache[data.src];

	    // Replace children if swapping templates.
	    if (oldData && oldData.src !== data.src) {
	      while (el.firstChild) {
	        el.removeChild(el.firstChild);
	      }
	    }

	    if (templateCacheItem) {
	      this.renderTemplate(templateCacheItem);
	      return;
	    }

	    fetcher(data.src, data.type).then(this.renderTemplate.bind(this));
	  },

	  renderTemplate: function renderTemplate(templateCacheItem) {
	    var el = this.el;
	    var data = this.data;
	    var templateData = {};

	    Object.keys(el.dataset).forEach(function convertToData(key) {
	      templateData[key] = el.dataset[key];
	    });
	    if (data.data) {
	      templateData = extend(templateData, el.getComputedAttribute(data.data));
	    }

	    var renderedTemplate = _renderTemplate(templateCacheItem.template, templateCacheItem.type, templateData);
	    el.insertAdjacentHTML(data.insert, renderedTemplate);
	  }
	});

	/**
	 * Helper to compile template, lazy-loading the template engine if needed.
	 */
	function compileTemplate(src, type, templateStr) {
	  return new Promise(function (resolve) {
	    injectTemplateLib(type).then(function () {
	      templateCache[src] = {
	        template: getCompiler(type)(templateStr.trim()),
	        type: type
	      };
	      resolve(templateCache[src]);
	    });
	  });
	}

	function _renderTemplate(template, type, context) {
	  switch (type) {
	    case HANDLEBARS:
	      {
	        return template(context);
	      }
	    case JADE:
	      {
	        return template(context);
	      }
	    case MUSTACHE:
	      {
	        return Mustache.render(template, context);
	      }
	    case NUNJUCKS:
	      {
	        return template.render(context);
	      }
	    default:
	      {
	        // If type not specified, assume HTML. Add some ES6 template string sugar.
	        console.log(template);
	        console.log(context);
	        return templateString(template, context);
	      }
	  }
	}

	/**
	 * Cache and compile templates.
	 */
	function fetchTemplateFromScriptTag(src, type) {
	  var compiler;
	  var scriptEl = document.querySelector(src);
	  var scriptType = scriptEl.getAttribute('type');
	  var templateStr = scriptEl.innerHTML;

	  // Try to infer template type from <script type> if type not specified.
	  if (!type) {
	    if (!scriptType) {
	      throw new Error('Must provide `type` attribute for <script> templates (e.g., handlebars, jade, nunjucks, html)');
	    }
	    if (scriptType.indexOf('handlebars') !== -1) {
	      type = HANDLEBARS;
	    } else if (scriptType.indexOf('jade') !== -1) {
	      type = JADE;
	    } else if (scriptType.indexOf('mustache') !== -1) {
	      type = MUSTACHE;
	    } else if (scriptType.indexOf('nunjucks') !== -1) {
	      type = NUNJUCKS;
	    } else if (scriptType.indexOf('html') !== -1) {
	      type = HTML;
	    } else {
	      error('Template type could not be inferred from the script tag. Please add a type.');
	      return;
	    }
	  }

	  return new Promise(function (resolve) {
	    compileTemplate(src, type, templateStr).then(function (template) {
	      resolve(template, type);
	    });
	  });
	}

	function fetchTemplateFromXHR(src, type) {
	  return new Promise(function (resolve) {
	    var request;
	    request = new XMLHttpRequest();
	    request.addEventListener('load', function () {
	      // Template fetched. Use template.
	      compileTemplate(src, type, request.response).then(function (template) {
	        resolve(template, type);
	      });
	    });
	    request.open('GET', src);
	    request.send();
	  });
	}

	/**
	 * Get compiler given type.
	 */
	function getCompiler(type) {
	  switch (type) {
	    case HANDLEBARS:
	      {
	        return compileHandlebarsTemplate;
	      }
	    case JADE:
	      {
	        return compileJadeTemplate;
	      }
	    case MUSTACHE:
	      {
	        return compileHandlebarsTemplate;
	      }
	    case NUNJUCKS:
	      {
	        return compileNunjucksTemplate;
	      }
	    default:
	      {
	        // If type not specified, assume raw HTML and no templating needed.
	        return function (str) {
	          return str;
	        };
	      }
	  }
	}

	function compileHandlebarsTemplate(templateStr) {
	  return Handlebars.compile(templateStr);
	}

	function compileJadeTemplate(templateStr) {
	  return jade.compile(templateStr);
	}

	function compileMustacheTemplate(templateStr) {
	  Mustache.parse(templateStr);
	  return templateStr;
	}

	function compileNunjucksTemplate(templateStr) {
	  return nunjucks.compile(templateStr);
	}

	function injectTemplateLib(type) {
	  return new Promise(function (resolve) {
	    // No lib injection required.
	    if (!type || type === 'html') {
	      return resolve();
	    }

	    var scriptEl = LIB_LOADED[type];

	    // Engine loaded.
	    if (LIB_LOADED[type] === true) {
	      return resolve();
	    }

	    // Start lazy-loading.
	    if (!scriptEl) {
	      scriptEl = document.createElement('script');
	      LIB_LOADED[type] = scriptEl;
	      scriptEl.setAttribute('src', LIB_SRC[type]);
	      log('Lazy-loading %s engine. Please add <script src="%s"> to your page.', type, LIB_SRC[type]);
	      document.body.appendChild(scriptEl);
	    }

	    // Wait for onload, whether just injected or already lazy-loading.
	    var prevOnload = scriptEl.onload || function () {};
	    scriptEl.onload = function () {
	      prevOnload();
	      LIB_LOADED[type] = true;
	      resolve();
	    };
	  });
	};

	AFRAME.registerComponent('template-set', {
	  schema: {
	    on: { type: 'string' },
	    src: { type: 'string' },
	    data: { type: 'string' }
	  },

	  init: function init() {
	    var data = this.data;
	    var el = this.el;
	    el.addEventListener(data.on, function () {
	      el.setAttribute('template', { src: data.src, data: data.data });
	    });
	  }
	});

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var compile = __webpack_require__(3),
	    resolve = __webpack_require__(40);

	module.exports = function (template, context /*, options*/) {
	  return resolve(compile(template), context, arguments[2]);
	};

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var esniff = __webpack_require__(4),
	    i,
	    current,
	    literals,
	    substitutions,
	    _sOut,
	    sEscape,
	    _sAhead,
	    _sIn,
	    sInEscape,
	    template;

	_sOut = function sOut(char) {
		if (char === '\\') return sEscape;
		if (char === '$') return _sAhead;
		current += char;
		return _sOut;
	};
	sEscape = function sEscape(char) {
		if (char !== '\\' && char !== '$') current += '\\';
		current += char;
		return _sOut;
	};
	_sAhead = function sAhead(char) {
		if (char === '{') {
			literals.push(current);
			current = '';
			return _sIn;
		}
		if (char === '$') {
			current += '$';
			return _sAhead;
		}
		current += '$' + char;
		return _sOut;
	};
	_sIn = function sIn(char) {
		var code = template.slice(i),
		    end;
		esniff(code, '}', function (j) {
			if (esniff.nest >= 0) return esniff.next();
			end = j;
		});
		if (end != null) {
			substitutions.push(template.slice(i, i + end));
			i += end;
			current = '';
			return _sOut;
		}
		end = code.length;
		i += end;
		current += code;
		return _sIn;
	};
	sInEscape = function sInEscape(char) {
		if (char !== '\\' && char !== '}') current += '\\';
		current += char;
		return _sIn;
	};

	module.exports = function (str) {
		var length, state, result;
		current = '';
		literals = [];
		substitutions = [];

		template = String(str);
		length = template.length;

		state = _sOut;
		for (i = 0; i < length; ++i) {
			state = state(template[i]);
		}if (state === _sOut) {
			literals.push(current);
		} else if (state === sEscape) {
			literals.push(current + '\\');
		} else if (state === _sAhead) {
			literals.push(current + '$');
		} else if (state === _sIn) {
			literals[literals.length - 1] += '${' + current;
		} else if (state === sInEscape) {
			literals[literals.length - 1] += '${' + current + '\\';
		}
		result = { literals: literals, substitutions: substitutions };
		literals = substitutions = null;
		return result;
	};

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var from = __webpack_require__(5),
	    primitiveSet = __webpack_require__(36),
	    value = __webpack_require__(18),
	    callable = __webpack_require__(34),
	    d = __webpack_require__(11),
	    eolSet = __webpack_require__(37),
	    wsSet = __webpack_require__(38),
	    hasOwnProperty = Object.prototype.hasOwnProperty,
	    preRegExpSet = primitiveSet.apply(null, from(';{=([,<>+-*/%&|^!~?:}')),
	    nonNameSet = primitiveSet.apply(null, from(';{=([,<>+-*/%&|^!~?:})].')),
	    move,
	    startCollect,
	    endCollect,
	    collectNest,
	    $ws,
	    $common,
	    $string,
	    $comment,
	    $multiComment,
	    $regExp,
	    i,
	    char,
	    line,
	    columnIndex,
	    afterWs,
	    previousChar,
	    nest,
	    nestedTokens,
	    results,
	    userCode,
	    userTriggerChar,
	    isUserTriggerOperatorChar,
	    userCallback,
	    quote,
	    collectIndex,
	    data,
	    nestRelease;

	move = function move(j) {
		if (!char) return;
		if (i >= j) return;
		while (i !== j) {
			if (!char) return;
			if (hasOwnProperty.call(wsSet, char)) {
				if (hasOwnProperty.call(eolSet, char)) {
					columnIndex = i;
					++line;
				}
			} else {
				previousChar = char;
			}
			char = userCode[++i];
		}
	};

	startCollect = function startCollect(oldNestRelease) {
		if (collectIndex != null) nestedTokens.push([data, collectIndex, oldNestRelease]);
		data = { point: i + 1, line: line, column: i + 1 - columnIndex };
		collectIndex = i;
	};

	endCollect = function endCollect() {
		var previous;
		data.raw = userCode.slice(collectIndex, i);
		results.push(data);
		if (nestedTokens.length) {
			previous = nestedTokens.pop();
			data = previous[0];
			collectIndex = previous[1];
			nestRelease = previous[2];
			return;
		}
		data = null;
		collectIndex = null;
		nestRelease = null;
	};

	collectNest = function collectNest() {
		var old = nestRelease;
		nestRelease = nest;
		++nest;
		move(i + 1);
		startCollect(old);
		return $ws;
	};

	$common = function $common() {
		if (char === '\'' || char === '"') {
			quote = char;
			char = userCode[++i];
			return $string;
		}
		if (char === '(' || char === '{' || char === '[') {
			++nest;
		} else if (char === ')' || char === '}' || char === ']') {
			if (nestRelease === --nest) endCollect();
		} else if (char === '/') {
			if (hasOwnProperty.call(preRegExpSet, previousChar)) {
				char = userCode[++i];
				return $regExp;
			}
		}
		if (char !== userTriggerChar || !isUserTriggerOperatorChar && previousChar && !afterWs && !hasOwnProperty.call(nonNameSet, previousChar)) {
			previousChar = char;
			char = userCode[++i];
			return $ws;
		}

		return userCallback(i, previousChar, nest);
	};

	$comment = function $comment() {
		while (true) {
			if (!char) return;
			if (hasOwnProperty.call(eolSet, char)) {
				columnIndex = i + 1;
				++line;
				return;
			}
			char = userCode[++i];
		}
	};

	$multiComment = function $multiComment() {
		while (true) {
			if (!char) return;
			if (char === '*') {
				char = userCode[++i];
				if (char === '/') return;
				continue;
			}
			if (hasOwnProperty.call(eolSet, char)) {
				columnIndex = i + 1;
				++line;
			}
			char = userCode[++i];
		}
	};

	$ws = function $ws() {
		var next;
		afterWs = false;
		while (true) {
			if (!char) return;
			if (hasOwnProperty.call(wsSet, char)) {
				afterWs = true;
				if (hasOwnProperty.call(eolSet, char)) {
					columnIndex = i + 1;
					++line;
				}
			} else if (char === '/') {
				next = userCode[i + 1];
				if (next === '/') {
					char = userCode[i += 2];
					afterWs = true;
					$comment();
				} else if (next === '*') {
					char = userCode[i += 2];
					afterWs = true;
					$multiComment();
				} else {
					break;
				}
			} else {
				break;
			}
			char = userCode[++i];
		}
		return $common;
	};

	$string = function $string() {
		while (true) {
			if (!char) return;
			if (char === quote) {
				char = userCode[++i];
				previousChar = quote;
				return $ws;
			}
			if (char === '\\') {
				if (hasOwnProperty.call(eolSet, userCode[++i])) {
					columnIndex = i + 1;
					++line;
				}
			}
			char = userCode[++i];
		}
	};

	$regExp = function $regExp() {
		while (true) {
			if (!char) return;
			if (char === '/') {
				previousChar = '/';
				char = userCode[++i];
				return $ws;
			}
			if (char === '\\') ++i;
			char = userCode[++i];
		}
	};

	module.exports = exports = function (_exports) {
		function exports(_x, _x2, _x3) {
			return _exports.apply(this, arguments);
		}

		exports.toString = function () {
			return _exports.toString();
		};

		return exports;
	}(function (code, triggerChar, callback) {
		var state;

		userCode = String(value(code));
		userTriggerChar = String(value(triggerChar));
		if (userTriggerChar.length !== 1) {
			throw new TypeError(userTriggerChar + " should be one character long string");
		}
		userCallback = callable(callback);
		isUserTriggerOperatorChar = hasOwnProperty.call(nonNameSet, userTriggerChar);
		i = 0;
		char = userCode[i];
		line = 1;
		columnIndex = 0;
		afterWs = false;
		previousChar = null;
		nest = 0;
		nestedTokens = [];
		results = [];
		exports.forceStop = false;
		state = $ws;
		while (state) {
			state = state();
		}return results;
	});

	Object.defineProperties(exports, {
		$ws: d($ws),
		$common: d($common),
		collectNest: d(collectNest),
		move: d(move),
		index: d.gs(function () {
			return i;
		}),
		line: d.gs(function () {
			return line;
		}),
		nest: d.gs(function () {
			return nest;
		}),
		columnIndex: d.gs(function () {
			return columnIndex;
		}),
		next: d(function (step) {
			if (!char) return;
			move(i + (step || 1));
			return $ws();
		}),
		resume: d(function () {
			return $common;
		})
	});

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(6)() ? Array.from : __webpack_require__(7);

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function () {
		var from = Array.from,
		    arr,
		    result;
		if (typeof from !== 'function') return false;
		arr = ['raz', 'dwa'];
		result = from(arr);
		return Boolean(result && result !== arr && result[1] === 'dwa');
	};

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var iteratorSymbol = __webpack_require__(8).iterator,
	    isArguments = __webpack_require__(26),
	    isFunction = __webpack_require__(27),
	    toPosInt = __webpack_require__(29),
	    callable = __webpack_require__(34),
	    validValue = __webpack_require__(18),
	    isString = __webpack_require__(35),
	    isArray = Array.isArray,
	    call = Function.prototype.call,
	    desc = { configurable: true, enumerable: true, writable: true, value: null },
	    defineProperty = Object.defineProperty;

	module.exports = function (arrayLike /*, mapFn, thisArg*/) {
		var mapFn = arguments[1],
		    thisArg = arguments[2],
		    Constructor,
		    i,
		    j,
		    arr,
		    l,
		    code,
		    iterator,
		    result,
		    getIterator,
		    value;

		arrayLike = Object(validValue(arrayLike));

		if (mapFn != null) callable(mapFn);
		if (!this || this === Array || !isFunction(this)) {
			// Result: Plain array
			if (!mapFn) {
				if (isArguments(arrayLike)) {
					// Source: Arguments
					l = arrayLike.length;
					if (l !== 1) return Array.apply(null, arrayLike);
					arr = new Array(1);
					arr[0] = arrayLike[0];
					return arr;
				}
				if (isArray(arrayLike)) {
					// Source: Array
					arr = new Array(l = arrayLike.length);
					for (i = 0; i < l; ++i) {
						arr[i] = arrayLike[i];
					}return arr;
				}
			}
			arr = [];
		} else {
			// Result: Non plain array
			Constructor = this;
		}

		if (!isArray(arrayLike)) {
			if ((getIterator = arrayLike[iteratorSymbol]) !== undefined) {
				// Source: Iterator
				iterator = callable(getIterator).call(arrayLike);
				if (Constructor) arr = new Constructor();
				result = iterator.next();
				i = 0;
				while (!result.done) {
					value = mapFn ? call.call(mapFn, thisArg, result.value, i) : result.value;
					if (!Constructor) {
						arr[i] = value;
					} else {
						desc.value = value;
						defineProperty(arr, i, desc);
					}
					result = iterator.next();
					++i;
				}
				l = i;
			} else if (isString(arrayLike)) {
				// Source: String
				l = arrayLike.length;
				if (Constructor) arr = new Constructor();
				for (i = 0, j = 0; i < l; ++i) {
					value = arrayLike[i];
					if (i + 1 < l) {
						code = value.charCodeAt(0);
						if (code >= 0xD800 && code <= 0xDBFF) value += arrayLike[++i];
					}
					value = mapFn ? call.call(mapFn, thisArg, value, j) : value;
					if (!Constructor) {
						arr[j] = value;
					} else {
						desc.value = value;
						defineProperty(arr, j, desc);
					}
					++j;
				}
				l = j;
			}
		}
		if (l === undefined) {
			// Source: array or array-like
			l = toPosInt(arrayLike.length);
			if (Constructor) arr = new Constructor(l);
			for (i = 0; i < l; ++i) {
				value = mapFn ? call.call(mapFn, thisArg, arrayLike[i], i) : arrayLike[i];
				if (!Constructor) {
					arr[i] = value;
				} else {
					desc.value = value;
					defineProperty(arr, i, desc);
				}
			}
		}
		if (Constructor) {
			desc.value = null;
			arr.length = l;
		}
		return arr;
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(9)() ? Symbol : __webpack_require__(10);

/***/ },
/* 9 */
/***/ function(module, exports) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var validTypes = { object: true, symbol: true };

	module.exports = function () {
		var symbol;
		if (typeof Symbol !== 'function') return false;
		symbol = Symbol('test symbol');
		try {
			String(symbol);
		} catch (e) {
			return false;
		}

		// Return 'true' also for polyfills
		if (!validTypes[_typeof(Symbol.iterator)]) return false;
		if (!validTypes[_typeof(Symbol.toPrimitive)]) return false;
		if (!validTypes[_typeof(Symbol.toStringTag)]) return false;

		return true;
	};

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	// ES2015 Symbol polyfill for environments that do not (or partially) support it

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var d = __webpack_require__(11),
	    validateSymbol = __webpack_require__(24),
	    create = Object.create,
	    defineProperties = Object.defineProperties,
	    defineProperty = Object.defineProperty,
	    objPrototype = Object.prototype,
	    NativeSymbol,
	    SymbolPolyfill,
	    HiddenSymbol,
	    globalSymbols = create(null),
	    isNativeSafe;

	if (typeof Symbol === 'function') {
		NativeSymbol = Symbol;
		try {
			String(NativeSymbol());
			isNativeSafe = true;
		} catch (ignore) {}
	}

	var generateName = function () {
		var created = create(null);
		return function (desc) {
			var postfix = 0,
			    name,
			    ie11BugWorkaround;
			while (created[desc + (postfix || '')]) {
				++postfix;
			}desc += postfix || '';
			created[desc] = true;
			name = '@@' + desc;
			defineProperty(objPrototype, name, d.gs(null, function (value) {
				// For IE11 issue see:
				// https://connect.microsoft.com/IE/feedbackdetail/view/1928508/
				//    ie11-broken-getters-on-dom-objects
				// https://github.com/medikoo/es6-symbol/issues/12
				if (ie11BugWorkaround) return;
				ie11BugWorkaround = true;
				defineProperty(this, name, d(value));
				ie11BugWorkaround = false;
			}));
			return name;
		};
	}();

	// Internal constructor (not one exposed) for creating Symbol instances.
	// This one is used to ensure that `someSymbol instanceof Symbol` always return false
	HiddenSymbol = function _Symbol(description) {
		if (this instanceof HiddenSymbol) throw new TypeError('Symbol is not a constructor');
		return SymbolPolyfill(description);
	};

	// Exposed `Symbol` constructor
	// (returns instances of HiddenSymbol)
	module.exports = SymbolPolyfill = function _Symbol2(description) {
		var symbol;
		if (this instanceof _Symbol2) throw new TypeError('Symbol is not a constructor');
		if (isNativeSafe) return NativeSymbol(description);
		symbol = create(HiddenSymbol.prototype);
		description = description === undefined ? '' : String(description);
		return defineProperties(symbol, {
			__description__: d('', description),
			__name__: d('', generateName(description))
		});
	};
	defineProperties(SymbolPolyfill, {
		for: d(function (key) {
			if (globalSymbols[key]) return globalSymbols[key];
			return globalSymbols[key] = SymbolPolyfill(String(key));
		}),
		keyFor: d(function (s) {
			var key;
			validateSymbol(s);
			for (key in globalSymbols) {
				if (globalSymbols[key] === s) return key;
			}
		}),

		// To ensure proper interoperability with other native functions (e.g. Array.from)
		// fallback to eventual native implementation of given symbol
		hasInstance: d('', NativeSymbol && NativeSymbol.hasInstance || SymbolPolyfill('hasInstance')),
		isConcatSpreadable: d('', NativeSymbol && NativeSymbol.isConcatSpreadable || SymbolPolyfill('isConcatSpreadable')),
		iterator: d('', NativeSymbol && NativeSymbol.iterator || SymbolPolyfill('iterator')),
		match: d('', NativeSymbol && NativeSymbol.match || SymbolPolyfill('match')),
		replace: d('', NativeSymbol && NativeSymbol.replace || SymbolPolyfill('replace')),
		search: d('', NativeSymbol && NativeSymbol.search || SymbolPolyfill('search')),
		species: d('', NativeSymbol && NativeSymbol.species || SymbolPolyfill('species')),
		split: d('', NativeSymbol && NativeSymbol.split || SymbolPolyfill('split')),
		toPrimitive: d('', NativeSymbol && NativeSymbol.toPrimitive || SymbolPolyfill('toPrimitive')),
		toStringTag: d('', NativeSymbol && NativeSymbol.toStringTag || SymbolPolyfill('toStringTag')),
		unscopables: d('', NativeSymbol && NativeSymbol.unscopables || SymbolPolyfill('unscopables'))
	});

	// Internal tweaks for real symbol producer
	defineProperties(HiddenSymbol.prototype, {
		constructor: d(SymbolPolyfill),
		toString: d('', function () {
			return this.__name__;
		})
	});

	// Proper implementation of methods exposed on Symbol.prototype
	// They won't be accessible on produced symbol instances as they derive from HiddenSymbol.prototype
	defineProperties(SymbolPolyfill.prototype, {
		toString: d(function () {
			return 'Symbol (' + validateSymbol(this).__description__ + ')';
		}),
		valueOf: d(function () {
			return validateSymbol(this);
		})
	});
	defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toPrimitive, d('', function () {
		var symbol = validateSymbol(this);
		if ((typeof symbol === 'undefined' ? 'undefined' : _typeof(symbol)) === 'symbol') return symbol;
		return symbol.toString();
	}));
	defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toStringTag, d('c', 'Symbol'));

	// Proper implementaton of toPrimitive and toStringTag for returned symbol instances
	defineProperty(HiddenSymbol.prototype, SymbolPolyfill.toStringTag, d('c', SymbolPolyfill.prototype[SymbolPolyfill.toStringTag]));

	// Note: It's important to define `toPrimitive` as last one, as some implementations
	// implement `toPrimitive` natively without implementing `toStringTag` (or other specified symbols)
	// And that may invoke error in definition flow:
	// See: https://github.com/medikoo/es6-symbol/issues/13#issuecomment-164146149
	defineProperty(HiddenSymbol.prototype, SymbolPolyfill.toPrimitive, d('c', SymbolPolyfill.prototype[SymbolPolyfill.toPrimitive]));

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var assign = __webpack_require__(12),
	    normalizeOpts = __webpack_require__(19),
	    isCallable = __webpack_require__(20),
	    contains = __webpack_require__(21),
	    d;

	d = module.exports = function (dscr, value /*, options*/) {
		var c, e, w, options, desc;
		if (arguments.length < 2 || typeof dscr !== 'string') {
			options = value;
			value = dscr;
			dscr = null;
		} else {
			options = arguments[2];
		}
		if (dscr == null) {
			c = w = true;
			e = false;
		} else {
			c = contains.call(dscr, 'c');
			e = contains.call(dscr, 'e');
			w = contains.call(dscr, 'w');
		}

		desc = { value: value, configurable: c, enumerable: e, writable: w };
		return !options ? desc : assign(normalizeOpts(options), desc);
	};

	d.gs = function (dscr, get, set /*, options*/) {
		var c, e, options, desc;
		if (typeof dscr !== 'string') {
			options = set;
			set = get;
			get = dscr;
			dscr = null;
		} else {
			options = arguments[3];
		}
		if (get == null) {
			get = undefined;
		} else if (!isCallable(get)) {
			options = get;
			get = set = undefined;
		} else if (set == null) {
			set = undefined;
		} else if (!isCallable(set)) {
			options = set;
			set = undefined;
		}
		if (dscr == null) {
			c = true;
			e = false;
		} else {
			c = contains.call(dscr, 'c');
			e = contains.call(dscr, 'e');
		}

		desc = { get: get, set: set, configurable: c, enumerable: e };
		return !options ? desc : assign(normalizeOpts(options), desc);
	};

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(13)() ? Object.assign : __webpack_require__(14);

/***/ },
/* 13 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function () {
		var assign = Object.assign,
		    obj;
		if (typeof assign !== 'function') return false;
		obj = { foo: 'raz' };
		assign(obj, { bar: 'dwa' }, { trzy: 'trzy' });
		return obj.foo + obj.bar + obj.trzy === 'razdwatrzy';
	};

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var keys = __webpack_require__(15),
	    value = __webpack_require__(18),
	    max = Math.max;

	module.exports = function (dest, src /*, …srcn*/) {
		var error,
		    i,
		    l = max(arguments.length, 2),
		    assign;
		dest = Object(value(dest));
		assign = function assign(key) {
			try {
				dest[key] = src[key];
			} catch (e) {
				if (!error) error = e;
			}
		};
		for (i = 1; i < l; ++i) {
			src = arguments[i];
			keys(src).forEach(assign);
		}
		if (error !== undefined) throw error;
		return dest;
	};

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(16)() ? Object.keys : __webpack_require__(17);

/***/ },
/* 16 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function () {
		try {
			Object.keys('primitive');
			return true;
		} catch (e) {
			return false;
		}
	};

/***/ },
/* 17 */
/***/ function(module, exports) {

	'use strict';

	var keys = Object.keys;

	module.exports = function (object) {
		return keys(object == null ? object : Object(object));
	};

/***/ },
/* 18 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (value) {
		if (value == null) throw new TypeError("Cannot use null or undefined");
		return value;
	};

/***/ },
/* 19 */
/***/ function(module, exports) {

	'use strict';

	var forEach = Array.prototype.forEach,
	    create = Object.create;

	var process = function process(src, obj) {
		var key;
		for (key in src) {
			obj[key] = src[key];
		}
	};

	module.exports = function (options /*, …options*/) {
		var result = create(null);
		forEach.call(arguments, function (options) {
			if (options == null) return;
			process(Object(options), result);
		});
		return result;
	};

/***/ },
/* 20 */
/***/ function(module, exports) {

	// Deprecated

	'use strict';

	module.exports = function (obj) {
	  return typeof obj === 'function';
	};

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(22)() ? String.prototype.contains : __webpack_require__(23);

/***/ },
/* 22 */
/***/ function(module, exports) {

	'use strict';

	var str = 'razdwatrzy';

	module.exports = function () {
		if (typeof str.contains !== 'function') return false;
		return str.contains('dwa') === true && str.contains('foo') === false;
	};

/***/ },
/* 23 */
/***/ function(module, exports) {

	'use strict';

	var indexOf = String.prototype.indexOf;

	module.exports = function (searchString /*, position*/) {
		return indexOf.call(this, searchString, arguments[1]) > -1;
	};

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var isSymbol = __webpack_require__(25);

	module.exports = function (value) {
		if (!isSymbol(value)) throw new TypeError(value + " is not a symbol");
		return value;
	};

/***/ },
/* 25 */
/***/ function(module, exports) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	module.exports = function (x) {
		if (!x) return false;
		if ((typeof x === 'undefined' ? 'undefined' : _typeof(x)) === 'symbol') return true;
		if (!x.constructor) return false;
		if (x.constructor.name !== 'Symbol') return false;
		return x[x.constructor.toStringTag] === 'Symbol';
	};

/***/ },
/* 26 */
/***/ function(module, exports) {

	'use strict';

	var toString = Object.prototype.toString,
	    id = toString.call(function () {
	  return arguments;
	}());

	module.exports = function (x) {
	  return toString.call(x) === id;
	};

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var toString = Object.prototype.toString,
	    id = toString.call(__webpack_require__(28));

	module.exports = function (f) {
	  return typeof f === "function" && toString.call(f) === id;
	};

/***/ },
/* 28 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function () {};

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var toInteger = __webpack_require__(30),
	    max = Math.max;

	module.exports = function (value) {
	  return max(0, toInteger(value));
	};

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var sign = __webpack_require__(31),
	    abs = Math.abs,
	    floor = Math.floor;

	module.exports = function (value) {
		if (isNaN(value)) return 0;
		value = Number(value);
		if (value === 0 || !isFinite(value)) return value;
		return sign(value) * floor(abs(value));
	};

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(32)() ? Math.sign : __webpack_require__(33);

/***/ },
/* 32 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function () {
		var sign = Math.sign;
		if (typeof sign !== 'function') return false;
		return sign(10) === 1 && sign(-20) === -1;
	};

/***/ },
/* 33 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (value) {
		value = Number(value);
		if (isNaN(value) || value === 0) return value;
		return value > 0 ? 1 : -1;
	};

/***/ },
/* 34 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (fn) {
		if (typeof fn !== 'function') throw new TypeError(fn + " is not a function");
		return fn;
	};

/***/ },
/* 35 */
/***/ function(module, exports) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var toString = Object.prototype.toString,
	    id = toString.call('');

	module.exports = function (x) {
			return typeof x === 'string' || x && (typeof x === 'undefined' ? 'undefined' : _typeof(x)) === 'object' && (x instanceof String || toString.call(x) === id) || false;
	};

/***/ },
/* 36 */
/***/ function(module, exports) {

	'use strict';

	var forEach = Array.prototype.forEach,
	    create = Object.create;

	module.exports = function (arg /*, …args*/) {
		var set = create(null);
		forEach.call(arguments, function (name) {
			set[name] = true;
		});
		return set;
	};

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var from = __webpack_require__(5),
	    primitiveSet = __webpack_require__(36);

	module.exports = primitiveSet.apply(null, from('\n\r\u2028\u2029'));

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var primitiveSet = __webpack_require__(36),
	    eol = __webpack_require__(37),
	    inline = __webpack_require__(39);

	module.exports = primitiveSet.apply(null, Object.keys(eol).concat(Object.keys(inline)));

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var from = __webpack_require__(5),
	    primitiveSet = __webpack_require__(36);

	module.exports = primitiveSet.apply(null, from(' \f\t\x0B\u200B\xA0\u1680\u200B\u180E' + '\u2000\u200B\u2001\u2002\u200B\u2003\u2004\u200B\u2005\u2006\u200B\u2007\u2008\u200B\u2009\u200A' + '\u200B\u200B\u200B\u202F\u205F\u200B\u3000'));

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var resolve = __webpack_require__(41),
	    passthru = __webpack_require__(43);

	module.exports = function (data, context /*, options*/) {
	  return passthru.apply(null, resolve(data, context, arguments[2]));
	};

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var value = __webpack_require__(18),
	    normalize = __webpack_require__(19),
	    isVarNameValid = __webpack_require__(42),
	    map = Array.prototype.map,
	    keys = Object.keys,
	    stringify = JSON.stringify;

	module.exports = function (data, context /*, options*/) {
		var names,
		    argNames,
		    argValues,
		    options = Object(arguments[2]);

		value(data) && value(data.literals) && value(data.substitutions);
		context = normalize(context);
		names = keys(context).filter(isVarNameValid);
		argNames = names.join(', ');
		argValues = names.map(function (name) {
			return context[name];
		});
		return [data.literals].concat(map.call(data.substitutions, function (expr) {
			var resolver;
			if (!expr) return undefined;
			try {
				resolver = new Function(argNames, 'return (' + expr + ')');
			} catch (e) {
				throw new TypeError("Unable to compile expression:\n\targs: " + stringify(argNames) + "\n\tbody: " + stringify(expr) + "\n\terror: " + e.stack);
			}
			try {
				return resolver.apply(null, argValues);
			} catch (e) {
				if (options.partial) return '${' + expr + '}';
				throw new TypeError("Unable to resolve expression:\n\targs: " + stringify(argNames) + "\n\tbody: " + stringify(expr) + "\n\terror: " + e.stack);
			}
		}));
	};

/***/ },
/* 42 */
/***/ function(module, exports) {

	// Credit: Mathias Bynens -> https://mathiasbynens.be/demo/javascript-identifier-regex

	'use strict';

	module.exports = RegExp.prototype.test.bind(/^(?!(?:do|if|in|for|let|new|try|var|case|else|enum|eval|null|this|true|void|with|await|break|catch|class|const|false|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$)(?:[\$A-Z_a-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCA0-\uDCDF\uDCFF\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F\uDFE0]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D])(?:[\$0-9A-Z_a-z\xAA\xB5\xB7\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B4\u08B6-\u08BD\u08D4-\u08E1\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D54-\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u1371\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFB-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDCA-\uDDCC\uDDD0-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE3E\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC00-\uDC4A\uDC50-\uDC59\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9\uDF00-\uDF19\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDCA0-\uDCE9\uDCFF\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC36\uDC38-\uDC40\uDC50-\uDC59\uDC72-\uDC8F\uDC92-\uDCA7\uDCA9-\uDCB6]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F\uDFE0]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6\uDD00-\uDD4A\uDD50-\uDD59]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF])*$/);

/***/ },
/* 43 */
/***/ function(module, exports) {

	'use strict';

	var reduce = Array.prototype.reduce;

	module.exports = function (literals /*, …substitutions*/) {
		var args = arguments;
		return reduce.call(literals, function (a, b, i) {
			return a + (args[i] === undefined ? '' : String(args[i])) + b;
		});
	};

/***/ },
/* 44 */
/***/ function(module, exports) {

	'use strict';

	/* global AFRAME THREE */

	if (typeof AFRAME === 'undefined') {
	  throw new Error('Component attempted to register before AFRAME was available.');
	}

	var degToRad = THREE.Math.degToRad;

	/**
	 * Linear Interpolation component for A-Frame.
	 */
	AFRAME.registerComponent('lerp', {
	  schema: {
	    duration: { type: 'int', default: 100 }, // milliseconds (ms)
	    properties: { default: ['position', 'rotation', 'scale'] }
	  },

	  /**
	   * Called once when component is attached. Generally for initial setup.
	   */
	  init: function init() {
	    this.lerpingPosition = false;
	    this.lerpingRotation = false;
	    this.lerpingScale = false;

	    this.el.addEventListener('componentchanged', this.changedListener.bind(this));
	  },

	  /**
	   * Called on each scene tick.
	   */
	  tick: function tick(time, deltaTime) {
	    var progress;
	    var now = this.now();
	    var obj3d = this.el.object3D;

	    // Lerp position
	    if (this.lerpingPosition) {
	      progress = (now - this.startLerpTimePosition) / this.data.duration;
	      obj3d.position.lerpVectors(this.startPosition, this.targetPosition, progress);
	      if (progress >= 1) {
	        this.lerpingPosition = false;
	      }
	    }

	    // Slerp rotation
	    if (this.lerpingRotation) {
	      progress = (now - this.startLerpTimeRotation) / this.data.duration;
	      THREE.Quaternion.slerp(this.startRotation, this.targetRotation, obj3d.quaternion, progress);
	      if (progress >= 1) {
	        this.lerpingRotation = false;
	      }
	    }

	    // Lerp scale
	    if (this.lerpingScale) {
	      progress = (now - this.startLerpTimeScale) / this.data.duration;
	      obj3d.scale.lerpVectors(this.startScale, this.targetScale, progress);
	      if (progress >= 1) {
	        this.lerpingScale = false;
	      }
	    }
	  },

	  changedListener: function changedListener(event) {
	    var name = event.detail.name;
	    var oldData = event.detail.oldData;
	    var newData = event.detail.newData;

	    if (this.data.properties.indexOf(name) == -1) {
	      return;
	    }

	    if (name == 'position') {
	      this.toPosition(oldData, newData);
	    } else if (name == 'rotation') {
	      this.toRotation(oldData, newData);
	    } else if (name == 'scale') {
	      this.toScale(oldData, newData);
	    }
	  },

	  /**
	   * Start lerp to position (vec3)
	   */
	  toPosition: function toPosition(from, to) {
	    this.lerpingPosition = true;
	    this.startLerpTimePosition = this.now();
	    this.startPosition = new THREE.Vector3(from.x, from.y, from.z);
	    this.targetPosition = new THREE.Vector3(to.x, to.y, to.z);
	  },

	  /**
	   * Start lerp to euler rotation (vec3,'YXZ')
	   */
	  toRotation: function toRotation(from, to) {
	    this.lerpingRotation = true;
	    this.startLerpTimeRotation = this.now();
	    this.startRotation = new THREE.Quaternion();
	    this.startRotation.setFromEuler(new THREE.Euler(degToRad(from.x), degToRad(from.y), degToRad(from.z), 'YXZ'));
	    this.targetRotation = new THREE.Quaternion();
	    this.targetRotation.setFromEuler(new THREE.Euler(degToRad(to.x), degToRad(to.y), degToRad(to.z), 'YXZ'));
	  },

	  /**
	   * Start lerp to scale (vec3)
	   */
	  toScale: function toScale(from, to) {
	    this.lerpingScale = true;
	    this.startLerpTimeScale = this.now();
	    this.startScale = new THREE.Vector3(from.x, from.y, from.z);
	    this.targetScale = new THREE.Vector3(to.x, to.y, to.z);
	  },

	  /**
	   * Returns the current time in milliseconds (ms)
	   */
	  now: function now() {
	    return Date.now();
	  }
	});

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var options = __webpack_require__(46);
	var util = __webpack_require__(47);
	var NafLogger = __webpack_require__(48);
	var Schemas = __webpack_require__(49);
	var NetworkEntities = __webpack_require__(50);
	var NetworkConnection = __webpack_require__(51);

	var naf = {};
	naf.app = '';
	naf.room = '';
	naf.clientId = '';
	naf.options = options;
	naf.utils = util;
	naf.log = new NafLogger();
	naf.schemas = new Schemas();
	naf.version = "0.1.0";

	var entities = new NetworkEntities();
	var connection = new NetworkConnection(entities);
	naf.connection = naf.c = connection;
	naf.entities = naf.e = entities;

	module.exports = window.NAF = naf;

/***/ },
/* 46 */
/***/ function(module, exports) {

	"use strict";

	var options = {
	  debug: false,
	  updateRate: 15, // How often network components call `sync`
	  compressSyncPackets: false, // compress network component sync packet json
	  useLerp: true // when networked entities are created the aframe-lerp-component is attched to the root
	};

	module.exports = options;

/***/ },
/* 47 */
/***/ function(module, exports) {

	'use strict';

	module.exports.whenEntityLoaded = function (entity, callback) {
	  if (entity.hasLoaded) {
	    callback();
	  }
	  entity.addEventListener('loaded', function () {
	    callback();
	  });
	};

	module.exports.createHtmlNodeFromString = function (str) {
	  var div = document.createElement('div');
	  div.innerHTML = str;
	  var child = div.firstChild;
	  return child;
	};

	module.exports.getNetworkOwner = function (entity) {
	  if (entity.components.hasOwnProperty('network')) {
	    return entity.components['network'].data.owner;
	  }
	  return null;
	};

	module.exports.now = function () {
	  return Date.now();
	};

	module.exports.delimiter = '|||';

/***/ },
/* 48 */
/***/ function(module, exports) {

	"use strict";

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var NafLogger = function () {
	  function NafLogger() {
	    _classCallCheck(this, NafLogger);

	    this.debug = false;
	  }

	  _createClass(NafLogger, [{
	    key: "setDebug",
	    value: function setDebug(debug) {
	      this.debug = debug;
	    }
	  }, {
	    key: "write",
	    value: function write() {
	      if (this.debug) {
	        console.log.apply(this, arguments);
	      }
	    }
	  }, {
	    key: "error",
	    value: function error() {
	      console.error.apply(this, arguments);
	    }
	  }]);

	  return NafLogger;
	}();

	module.exports = NafLogger;

/***/ },
/* 49 */
/***/ function(module, exports) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Schemas = function () {
	  function Schemas() {
	    _classCallCheck(this, Schemas);

	    this.dict = {};
	  }

	  _createClass(Schemas, [{
	    key: 'add',
	    value: function add(schema) {
	      if (this.validate(schema)) {
	        this.dict[schema.template] = schema;
	      } else {
	        NAF.log.error('Schema not valid: ', schema);
	        NAF.log.error('See https://github.com/haydenjameslee/networked-aframe#syncing-custom-components');
	      }
	    }
	  }, {
	    key: 'hasTemplate',
	    value: function hasTemplate(template) {
	      return this.dict.hasOwnProperty(template);
	    }
	  }, {
	    key: 'getComponents',
	    value: function getComponents(template) {
	      if (this.hasTemplate(template)) {
	        return this.dict[template].components;
	      } else {
	        NAF.log.error('Schema with template ' + template + ' has not been added to naf.schemas yet');
	        return null;
	      }
	    }
	  }, {
	    key: 'validate',
	    value: function validate(schema) {
	      return schema.hasOwnProperty('template') && schema.hasOwnProperty('components');
	    }
	  }, {
	    key: 'remove',
	    value: function remove(template) {
	      delete this.dict[template];
	    }
	  }, {
	    key: 'clear',
	    value: function clear() {
	      this.dict = {};
	    }
	  }]);

	  return Schemas;
	}();

	module.exports = Schemas;

/***/ },
/* 50 */
/***/ function(module, exports) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var NetworkEntities = function () {
	  function NetworkEntities() {
	    _classCallCheck(this, NetworkEntities);

	    this.entities = {};
	  }

	  _createClass(NetworkEntities, [{
	    key: 'createNetworkEntity',
	    value: function createNetworkEntity(template, position, rotation) {
	      var networkId = this.createEntityId();
	      NAF.log.write('Created network entity', networkId);
	      var entityData = {
	        networkId: networkId,
	        owner: NAF.clientId,
	        template: template,
	        components: {
	          position: position,
	          rotation: rotation
	        }
	      };
	      var entity = this.createLocalEntity(entityData);
	      return entity;
	    }
	  }, {
	    key: 'createAvatar',
	    value: function createAvatar(template, position, rotation) {
	      var avatar = this.createNetworkEntity(template, position, rotation);
	      avatar.setAttribute('visible', false);
	      avatar.setAttribute('follow-camera', '');
	      avatar.className += ' local-avatar';
	      avatar.removeAttribute('lerp');

	      var camera = document.querySelector('[camera]');
	      camera.setAttribute('position', position);
	      camera.setAttribute('rotation', rotation);

	      return avatar;
	    }
	  }, {
	    key: 'createLocalEntity',
	    value: function createLocalEntity(entityData) {
	      var entity = document.createElement('a-entity');
	      entity.setAttribute('id', 'naf-' + entityData.networkId);
	      if (NAF.options.useLerp) {
	        entity.setAttribute('lerp', '');
	      }

	      var template = entityData.template;
	      this.setTemplate(entity, template);

	      var components = this.getComponents(template);
	      this.initPosition(entity, entityData.components);
	      this.initRotation(entity, entityData.components);
	      this.setNetworkData(entity, entityData, components);

	      entity.initNafData = entityData;

	      var scene = document.querySelector('a-scene');
	      scene.appendChild(entity);
	      this.entities[entityData.networkId] = entity;

	      return entity;
	    }
	  }, {
	    key: 'setTemplate',
	    value: function setTemplate(entity, template) {
	      var templateEl = document.querySelector(template);
	      if (templateEl) {
	        entity.setAttribute('template', 'src:' + template);
	      } else {
	        NAF.log.error('NetworkEntities@createLocalEntity: Template not found: ' + template);
	      }
	    }
	  }, {
	    key: 'getComponents',
	    value: function getComponents(template) {
	      var components = ['position', 'rotation'];
	      if (NAF.schemas.hasTemplate(template)) {
	        components = NAF.schemas.getComponents(template);
	      }
	      return components;
	    }
	  }, {
	    key: 'initPosition',
	    value: function initPosition(entity, componentData) {
	      var hasPosition = componentData.hasOwnProperty('position');
	      if (hasPosition) {
	        var position = componentData.position;
	        entity.setAttribute('position', position);
	      }
	    }
	  }, {
	    key: 'initRotation',
	    value: function initRotation(entity, componentData) {
	      var hasRotation = componentData.hasOwnProperty('rotation');
	      if (hasRotation) {
	        var rotation = componentData.rotation;
	        entity.setAttribute('rotation', rotation);
	      }
	    }
	  }, {
	    key: 'setNetworkData',
	    value: function setNetworkData(entity, entityData, components) {
	      var networkData = {
	        owner: entityData.owner,
	        networkId: entityData.networkId,
	        components: components
	      };
	      entity.setAttribute('network', networkData);
	    }
	  }, {
	    key: 'updateEntity',
	    value: function updateEntity(client, dataType, entityData) {
	      var isCompressed = entityData[0] == 1;
	      var networkId = isCompressed ? entityData[1] : entityData.networkId;

	      if (this.hasEntity(networkId)) {
	        this.entities[networkId].emit('networkUpdate', { entityData: entityData }, false);
	      } else if (!isCompressed) {
	        NAF.log.write('Creating remote entity', entityData);
	        this.createLocalEntity(entityData);
	      }
	    }
	  }, {
	    key: 'completeSync',
	    value: function completeSync() {
	      for (var id in this.entities) {
	        if (this.entities.hasOwnProperty(id)) {
	          this.entities[id].emit('syncAll', null, false);
	        }
	      }
	    }
	  }, {
	    key: 'removeRemoteEntity',
	    value: function removeRemoteEntity(toClient, dataType, data) {
	      var id = data.networkId;
	      return this.removeEntity(id);
	    }
	  }, {
	    key: 'removeEntity',
	    value: function removeEntity(id) {
	      if (this.hasEntity(id)) {
	        var entity = this.entities[id];
	        delete this.entities[id];
	        entity.parentNode.removeChild(entity);
	        return entity;
	      } else {
	        return null;
	      }
	    }
	  }, {
	    key: 'removeEntitiesFromUser',
	    value: function removeEntitiesFromUser(user) {
	      var entityList = [];
	      for (var id in this.entities) {
	        var entityOwner = NAF.utils.getNetworkOwner(this.entities[id]);
	        if (entityOwner == user) {
	          var entity = this.removeEntity(id);
	          entityList.push(entity);
	        }
	      }
	      return entityList;
	    }
	  }, {
	    key: 'getEntity',
	    value: function getEntity(id) {
	      if (this.entities.hasOwnProperty(id)) {
	        return this.entities[id];
	      }
	      return null;
	    }
	  }, {
	    key: 'hasEntity',
	    value: function hasEntity(id) {
	      return this.entities.hasOwnProperty(id);
	    }
	  }, {
	    key: 'createEntityId',
	    value: function createEntityId() {
	      return Math.random().toString(36).substring(2, 9);
	    }
	  }]);

	  return NetworkEntities;
	}();

	module.exports = NetworkEntities;

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var WebRtcInterface = __webpack_require__(52);

	var NetworkConnection = function () {
	  function NetworkConnection(networkEntities) {
	    _classCallCheck(this, NetworkConnection);

	    this.entities = networkEntities;
	    this.setupDefaultDCSubs();

	    this.myRoomJoinTime = 0;
	    this.connectList = {};
	    this.dcIsActive = {};

	    this.loggedIn = false;
	    this.onLoggedInEvent = new Event('loggedIn');
	  }

	  _createClass(NetworkConnection, [{
	    key: 'setWebRtc',
	    value: function setWebRtc(webrtcInterface) {
	      this.webrtc = webrtcInterface;
	    }
	  }, {
	    key: 'setupDefaultDCSubs',
	    value: function setupDefaultDCSubs() {
	      this.dcSubscribers = {
	        'u': this.entities.updateEntity.bind(this.entities),
	        'r': this.entities.removeRemoteEntity.bind(this.entities)
	      };
	    }
	  }, {
	    key: 'connect',
	    value: function connect(appId, roomId) {
	      var enableAudio = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

	      NAF.app = appId;
	      NAF.room = roomId;

	      var streamOptions = {
	        audio: enableAudio,
	        video: false,
	        datachannel: true
	      };
	      this.webrtc.setStreamOptions(streamOptions);
	      this.webrtc.setDatachannelListeners(this.dcOpenListener.bind(this), this.dcCloseListener.bind(this), this.receiveDataChannelMessage.bind(this));
	      this.webrtc.setLoginListeners(this.loginSuccess.bind(this), this.loginFailure.bind(this));
	      this.webrtc.setRoomOccupantListener(this.occupantsReceived.bind(this));
	      this.webrtc.joinRoom(roomId);
	      this.webrtc.connect(appId);
	    }
	  }, {
	    key: 'onLogin',
	    value: function onLogin(callback) {
	      if (this.loggedIn) {
	        callback();
	      } else {
	        document.body.addEventListener('loggedIn', callback, false);
	      }
	    }
	  }, {
	    key: 'loginSuccess',
	    value: function loginSuccess(clientId) {
	      NAF.log.write('Networked-Aframe Client ID:', clientId);
	      NAF.clientId = clientId;
	      this.myRoomJoinTime = this.webrtc.getRoomJoinTime(clientId);
	      this.loggedIn = true;

	      document.body.dispatchEvent(this.onLoggedInEvent);
	    }
	  }, {
	    key: 'loginFailure',
	    value: function loginFailure(errorCode, message) {
	      NAF.log.error(errorCode, "failure to login");
	      this.loggedIn = false;
	    }
	  }, {
	    key: 'occupantsReceived',
	    value: function occupantsReceived(roomName, occupantList, isPrimary) {
	      this.connectList = occupantList;
	      for (var id in this.connectList) {
	        if (this.isNewClient(id) && this.myClientShouldStartConnection(id)) {
	          this.webrtc.startStreamConnection(id);
	        }
	      }
	    }
	  }, {
	    key: 'isConnected',
	    value: function isConnected() {
	      return this.loggedIn;
	    }
	  }, {
	    key: 'isMineAndConnected',
	    value: function isMineAndConnected(id) {
	      return NAF.clientId == id;
	    }
	  }, {
	    key: 'isNewClient',
	    value: function isNewClient(client) {
	      return !this.isConnectedTo(client);
	    }
	  }, {
	    key: 'isConnectedTo',
	    value: function isConnectedTo(client) {
	      return this.webrtc.getConnectStatus(client) === WebRtcInterface.IS_CONNECTED;
	    }
	  }, {
	    key: 'myClientShouldStartConnection',
	    value: function myClientShouldStartConnection(otherClient) {
	      var otherClientTimeJoined = this.connectList[otherClient].roomJoinTime;
	      return this.myRoomJoinTime <= otherClientTimeJoined;
	    }
	  }, {
	    key: 'dcOpenListener',
	    value: function dcOpenListener(user) {
	      NAF.log.write('Opened data channel from ' + user);
	      this.dcIsActive[user] = true;
	      this.entities.completeSync();
	    }
	  }, {
	    key: 'dcCloseListener',
	    value: function dcCloseListener(user) {
	      NAF.log.write('Closed data channel from ' + user);
	      this.dcIsActive[user] = false;
	      this.entities.removeEntitiesFromUser(user);
	    }
	  }, {
	    key: 'dcIsConnectedTo',
	    value: function dcIsConnectedTo(user) {
	      return this.dcIsActive.hasOwnProperty(user) && this.dcIsActive[user];
	    }
	  }, {
	    key: 'broadcastData',
	    value: function broadcastData(dataType, data, guaranteed) {
	      for (var id in this.connectList) {
	        this.sendData(id, dataType, data, guaranteed);
	      }
	    }
	  }, {
	    key: 'broadcastDataGuaranteed',
	    value: function broadcastDataGuaranteed(dataType, data) {
	      this.broadcastData(dataType, data, true);
	    }
	  }, {
	    key: 'sendData',
	    value: function sendData(toClient, dataType, data, guaranteed) {
	      if (this.dcIsConnectedTo(toClient)) {
	        if (guaranteed) {
	          this.webrtc.sendDataGuaranteed(toClient, dataType, data);
	        } else {
	          this.webrtc.sendDataP2P(toClient, dataType, data);
	        }
	      } else {
	        // console.error("NOT-CONNECTED", "not connected to " + toClient);
	      }
	    }
	  }, {
	    key: 'sendDataGuaranteed',
	    value: function sendDataGuaranteed(toClient, dataType, data) {
	      this.sendData(toClient, dataType, data, true);
	    }
	  }, {
	    key: 'subscribeToDataChannel',
	    value: function subscribeToDataChannel(dataType, callback) {
	      if (dataType == 'u' || dataType == 'r') {
	        NAF.log.error('NetworkConnection@subscribeToDataChannel: ' + dataType + ' is a reserved dataType. Choose another');
	        return;
	      }
	      this.dcSubscribers[dataType] = callback;
	    }
	  }, {
	    key: 'unsubscribeFromDataChannel',
	    value: function unsubscribeFromDataChannel(dataType) {
	      if (dataType == 'u' || dataType == 'r') {
	        NAF.log.error('NetworkConnection@unsubscribeFromDataChannel: ' + dataType + ' is a reserved dataType. Choose another');
	        return;
	      }
	      delete this.dcSubscribers[dataType];
	    }
	  }, {
	    key: 'receiveDataChannelMessage',
	    value: function receiveDataChannelMessage(fromClient, dataType, data) {
	      if (this.dcSubscribers.hasOwnProperty(dataType)) {
	        this.dcSubscribers[dataType](fromClient, dataType, data);
	      } else {
	        NAF.log.error('NetworkConnection@receiveDataChannelMessage: ' + dataType + ' has not been subscribed to yet. Call subscribeToDataChannel()');
	      }
	    }
	  }]);

	  return NetworkConnection;
	}();

	module.exports = NetworkConnection;

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var NafInterface = __webpack_require__(53);

	var WebRtcInterface = function (_NafInterface) {
	  _inherits(WebRtcInterface, _NafInterface);

	  function WebRtcInterface() {
	    _classCallCheck(this, WebRtcInterface);

	    // Plumbing
	    var _this = _possibleConstructorReturn(this, (WebRtcInterface.__proto__ || Object.getPrototypeOf(WebRtcInterface)).call(this));

	    _this.connectList = {};
	    _this.dcIsActive = {};
	    _this.networkEntities = {};
	    return _this;
	  }

	  // Call before `connect`


	  _createClass(WebRtcInterface, [{
	    key: 'joinRoom',
	    value: function joinRoom(roomId) {
	      this.notImplemented();
	    }
	  }, {
	    key: 'setStreamOptions',
	    value: function setStreamOptions(StreamOptions) {
	      this.notImplemented();
	    }
	  }, {
	    key: 'setDatachannelListeners',
	    value: function setDatachannelListeners(openListener, closedListener, messageListener) {
	      this.notImplemented();
	    }
	  }, {
	    key: 'setRoomOccupantListener',
	    value: function setRoomOccupantListener(occupantListener) {
	      this.notImplemented();
	    }
	  }, {
	    key: 'setLoginListeners',
	    value: function setLoginListeners(successListener, failureListener) {
	      this.notImplemented();
	    }

	    // Network actions

	  }, {
	    key: 'connect',
	    value: function connect(appId) {
	      this.notImplemented();
	    }
	  }, {
	    key: 'startStreamConnection',
	    value: function startStreamConnection(otherNetworkId) {
	      this.notImplemented();
	    }
	  }, {
	    key: 'sendDataP2P',
	    value: function sendDataP2P(networkId, dataType, data) {
	      this.notImplemented();
	    }
	  }, {
	    key: 'sendDataGuaranteed',
	    value: function sendDataGuaranteed(networkId, dataType, data) {
	      this.notImplemented();
	    }

	    // Getters

	  }, {
	    key: 'getRoomJoinTime',
	    value: function getRoomJoinTime(clientId) {
	      this.notImplemented();
	    }
	  }, {
	    key: 'getConnectStatus',
	    value: function getConnectStatus(networkId) {
	      this.notImplemented();
	    }
	  }]);

	  return WebRtcInterface;
	}(NafInterface);

	WebRtcInterface.IS_CONNECTED = 'IS_CONNECTED';
	WebRtcInterface.CONNECTING = 'CONNECTING';
	WebRtcInterface.NOT_CONNECTED = 'NOT_CONNECTED';

	module.exports = WebRtcInterface;

/***/ },
/* 53 */
/***/ function(module, exports) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var NafInterface = function () {
	  function NafInterface() {
	    _classCallCheck(this, NafInterface);
	  }

	  _createClass(NafInterface, [{
	    key: 'notImplemented',
	    value: function notImplemented() {
	      console.error('Interface method not implemented.');
	    }
	  }]);

	  return NafInterface;
	}();

	module.exports = NafInterface;

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var naf = __webpack_require__(45);

	var EasyRtcInterface = __webpack_require__(55);

	AFRAME.registerComponent('network-scene', {
	  schema: {
	    app: { default: 'default' },
	    room: { default: 'default' },
	    connectOnLoad: { default: true },
	    signallingUrl: { default: '/' },
	    audio: { default: false },
	    debug: { default: false },
	    onConnect: { default: 'onConnect' }
	  },

	  init: function init() {
	    this.el.addEventListener('connect', this.connect.bind(this));
	    if (this.data.connectOnLoad) {
	      this.el.emit('connect', null, false);
	    }
	  },

	  /**
	   * Connect to signalling server and begin connecting to other clients
	   */
	  connect: function connect() {
	    naf.log.setDebug(this.data.debug);
	    naf.log.write('Networked-Aframe Connecting...');

	    // easyrtc.enableDebug(true);
	    var easyRtc = new EasyRtcInterface(easyrtc, this.data.signallingUrl);
	    naf.connection.setWebRtc(easyRtc);
	    if (this.data.onConnect != '' && window.hasOwnProperty(this.data.onConnect)) {
	      naf.connection.onLogin(window[this.data.onConnect]);
	    }
	    naf.connection.connect(this.data.app, this.data.room, this.data.audio);
	  }
	});

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var naf = __webpack_require__(45);
	var WebRtcInterface = __webpack_require__(52);

	var EasyRtcInterface = function (_WebRtcInterface) {
	  _inherits(EasyRtcInterface, _WebRtcInterface);

	  function EasyRtcInterface(easyrtc, signallingUrl) {
	    _classCallCheck(this, EasyRtcInterface);

	    var _this = _possibleConstructorReturn(this, (EasyRtcInterface.__proto__ || Object.getPrototypeOf(EasyRtcInterface)).call(this));

	    _this.easyrtc = easyrtc;
	    _this.easyrtc.setSocketUrl(signallingUrl);
	    return _this;
	  }

	  /*
	   * Call before `connect`
	   */

	  _createClass(EasyRtcInterface, [{
	    key: 'joinRoom',
	    value: function joinRoom(roomId) {
	      this.easyrtc.joinRoom(roomId, null);
	    }
	  }, {
	    key: 'setRoomOccupantListener',
	    value: function setRoomOccupantListener(occupantListener) {
	      this.easyrtc.setRoomOccupantListener(occupantListener);
	    }

	    // options: { datachannel: bool, audio: bool }

	  }, {
	    key: 'setStreamOptions',
	    value: function setStreamOptions(options) {
	      // this.easyrtc.enableDebug(true);
	      this.easyrtc.enableDataChannels(options.datachannel);
	      this.easyrtc.enableVideo(false);
	      this.easyrtc.enableAudio(options.audio);
	      this.easyrtc.enableVideoReceive(false);
	      this.easyrtc.enableAudioReceive(options.audio);
	    }
	  }, {
	    key: 'setDatachannelListeners',
	    value: function setDatachannelListeners(openListener, closedListener, messageListener) {
	      this.easyrtc.setDataChannelOpenListener(openListener);
	      this.easyrtc.setDataChannelCloseListener(closedListener);
	      this.easyrtc.setPeerListener(messageListener);
	    }
	  }, {
	    key: 'setLoginListeners',
	    value: function setLoginListeners(successListener, failureListener) {
	      this.loginSuccess = successListener;
	      this.loginFailure = failureListener;
	    }

	    /*
	     * Network actions
	     */

	  }, {
	    key: 'connect',
	    value: function connect(appId) {
	      if (this.easyrtc.audioEnabled) {
	        this.connectWithAudio(appId);
	      } else {
	        this.easyrtc.connect(appId, this.loginSuccess, this.loginFailure);
	      }
	    }
	  }, {
	    key: 'connectWithAudio',
	    value: function connectWithAudio(appId) {
	      var that = this;

	      this.easyrtc.setStreamAcceptor(function (easyrtcid, stream) {
	        var audioEl = document.createElement("audio");
	        audioEl.setAttribute('id', 'audio-' + easyrtcid);
	        document.body.appendChild(audioEl);
	        that.easyrtc.setVideoObjectSrc(audioEl, stream);
	      });

	      this.easyrtc.setOnStreamClosed(function (easyrtcid) {
	        var audioEl = document.getElementById('audio-' + easyrtcid);
	        audioEl.parentNode.removeChild(audioEl);
	      });

	      this.easyrtc.initMediaSource(function () {
	        that.easyrtc.connect(appId, that.loginSuccess, that.loginFailure);
	      }, function (errorCode, errmesg) {
	        console.error(errorCode, errmesg);
	      });
	    }
	  }, {
	    key: 'startStreamConnection',
	    value: function startStreamConnection(networkId) {
	      this.easyrtc.call(networkId, function (caller, media) {
	        if (media === 'datachannel') {
	          naf.log.write('Successfully started datachannel to ', caller);
	        }
	      }, function (errorCode, errorText) {
	        console.error(errorCode, errorText);
	      }, function (wasAccepted) {
	        // console.log("was accepted=" + wasAccepted);
	      });
	    }
	  }, {
	    key: 'sendDataP2P',
	    value: function sendDataP2P(networkId, dataType, data) {
	      this.easyrtc.sendDataP2P(networkId, dataType, data);
	    }
	  }, {
	    key: 'sendDataGuaranteed',
	    value: function sendDataGuaranteed(networkId, dataType, data) {
	      this.easyrtc.sendDataWS(networkId, dataType, data);
	    }

	    /*
	     * Getters
	     */

	  }, {
	    key: 'getRoomJoinTime',
	    value: function getRoomJoinTime(clientId) {
	      var myRoomId = naf.room;
	      var joinTime = easyrtc.getRoomOccupantsAsMap(myRoomId)[clientId].roomJoinTime;
	      return joinTime;
	    }
	  }, {
	    key: 'getConnectStatus',
	    value: function getConnectStatus(networkId) {
	      var status = this.easyrtc.getConnectStatus(networkId);

	      if (status == this.easyrtc.IS_CONNECTED) {
	        return WebRtcInterface.IS_CONNECTED;
	      } else if (status == this.easyrtc.NOT_CONNECTED) {
	        return WebRtcInterface.NOT_CONNECTED;
	      } else {
	        return WebRtcInterface.CONNECTING;
	      }
	    }
	  }]);

	  return EasyRtcInterface;
	}(WebRtcInterface);

	module.exports = EasyRtcInterface;

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var naf = __webpack_require__(45);
	var deepEqual = __webpack_require__(57);

	AFRAME.registerComponent('network', {
	  schema: {
	    networkId: { type: 'string' },
	    owner: { type: 'string' },
	    components: { default: ['position', 'rotation'] }
	  },

	  init: function init() {
	    this.nextSyncTime = naf.utils.now() + 100000; // Gets properly set by first syncAll
	    this.cachedData = {};

	    if (this.el.initNafData) {
	      this.networkUpdateNaked(this.el.initNafData); // updates root element
	      this.waitForTemplateAndUpdateChildren();
	    }

	    if (this.isMine()) {
	      this.waitForLoadThenFirstSync();
	    }
	  },

	  waitForTemplateAndUpdateChildren: function waitForTemplateAndUpdateChildren() {
	    var that = this;
	    var callback = function callback() {
	      that.networkUpdateNaked(that.el.initNafData);
	    };
	    setTimeout(callback, 50);
	  },

	  waitForLoadThenFirstSync: function waitForLoadThenFirstSync() {
	    var that = this;
	    var callback = function callback() {
	      that.syncAll();
	    };
	    setTimeout(callback, 100);
	  },

	  update: function update(oldData) {
	    this.bindEvents();
	  },

	  bindEvents: function bindEvents() {
	    if (this.isMine()) {
	      this.el.addEventListener('sync', this.syncDirty.bind(this));
	      this.el.addEventListener('syncAll', this.syncAll.bind(this));
	    } else {
	      this.el.removeEventListener('sync', this.syncDirty);
	      this.el.removeEventListener('syncAll', this.syncAll);
	    }
	    this.el.addEventListener('networkUpdate', this.networkUpdate.bind(this));
	  },

	  tick: function tick() {
	    if (this.isMine() && this.needsToSync()) {
	      this.syncDirty();
	    }
	  },

	  needsToSync: function needsToSync() {
	    return naf.utils.now() >= this.nextSyncTime;
	  },

	  // Will only succeed if object is created after connected
	  isMine: function isMine() {
	    return this.hasOwnProperty('data') && naf.connection.isMineAndConnected(this.data.owner);
	  },

	  syncAll: function syncAll() {
	    this.updateNextSyncTime();
	    var components = this.getComponentsData(this.data.components);
	    var syncData = this.createSyncData(components);
	    naf.connection.broadcastDataGuaranteed('u', syncData);
	    this.updateCache(components);
	  },

	  syncDirty: function syncDirty() {
	    this.updateNextSyncTime();
	    var dirtyComps = this.getDirtyComponents();
	    if (dirtyComps.length == 0) {
	      return;
	    }
	    var components = this.getComponentsData(dirtyComps);
	    var syncData = this.createSyncData(components);
	    if (naf.options.compressSyncPackets) {
	      syncData = this.compressSyncData(syncData);
	    }
	    naf.connection.broadcastData('u', syncData);
	    this.updateCache(components);
	  },

	  getDirtyComponents: function getDirtyComponents() {
	    var newComps = this.el.components;
	    var syncedComps = this.data.components;
	    var dirtyComps = [];

	    for (var i in syncedComps) {
	      var name = syncedComps[i];
	      if (!newComps.hasOwnProperty(name)) {
	        continue;
	      }
	      if (!this.cachedData.hasOwnProperty(name)) {
	        dirtyComps.push(name);
	        continue;
	      }
	      var oldCompData = this.cachedData[name];
	      var newCompData = newComps[name].getData();
	      if (!deepEqual(oldCompData, newCompData)) {
	        dirtyComps.push(name);
	      }
	    }
	    return dirtyComps;
	  },

	  createSyncData: function createSyncData(components) {
	    var data = {
	      0: 0, // 0 for not compressed
	      networkId: this.data.networkId,
	      owner: this.data.owner,
	      template: '',
	      components: components
	    };
	    if (this.hasTemplate()) {
	      data.template = this.el.components.template.data.src;
	    }
	    return data;
	  },

	  /**
	    Compressed packet structure:
	    [
	      1, // 1 for compressed
	      networkId,
	      clientId,
	      template,
	      {
	        0: data, // key maps to index of synced components in network component schema
	        3: data,
	        4: data
	      }
	    ]
	  */
	  compressSyncData: function compressSyncData(syncData) {
	    var compressed = [];
	    compressed.push(1);
	    compressed.push(syncData.networkId);
	    compressed.push(syncData.owner);
	    compressed.push(syncData.template);

	    var compMap = this.compressComponents(syncData.components);

	    compressed.push(compMap);

	    return compressed;
	  },

	  compressComponents: function compressComponents(syncComponents) {
	    var compMap = {};
	    var components = this.data.components;
	    for (var i = 0; i < components.length; i++) {
	      var name;
	      if (typeof components[i] === 'string') {
	        name = components[i];
	      } else {
	        name = this.childSchemaToKey(components[i]);
	      }
	      if (syncComponents.hasOwnProperty(name)) {
	        compMap[i] = syncComponents[name];
	      }
	    }
	    return compMap;
	  },

	  /**
	    Uncompressed packet structure:
	    [
	      0: 0, // 0 for uncompressed
	      networkId: networkId,
	      owner: clientId,
	      template: template,
	      components: {
	        position: data,
	        scale: data,
	        .head|||visible: data
	      }
	    ]
	  */
	  decompressSyncData: function decompressSyncData(compressed) {
	    var entityData = {};
	    entityData[0] = 1;
	    entityData.networkId = compressed[1];
	    entityData.owner = compressed[2];
	    entityData.template = compressed[3];

	    var compressedComps = compressed[4];
	    var components = this.decompressComponents(compressedComps);
	    entityData.components = components;

	    return entityData;
	  },

	  decompressComponents: function decompressComponents(compressed) {
	    var decompressed = {};
	    var schemaComponents = this.data.components;
	    for (var i in compressed) {
	      var name;
	      var schemaComp = schemaComponents[i];
	      if (typeof schemaComp === "string") {
	        name = schemaComp;
	      } else {
	        name = this.childSchemaToKey(schemaComp);
	      }
	      decompressed[name] = compressed[i];
	    }
	    return decompressed;
	  },

	  getComponentsData: function getComponentsData(schemaComponents) {
	    var elComponents = this.el.components;
	    var compsWithData = {};

	    for (var i in schemaComponents) {
	      var element = schemaComponents[i];

	      if (typeof element === 'string') {
	        if (elComponents.hasOwnProperty(element)) {
	          var name = element;
	          var elComponent = elComponents[name];
	          compsWithData[name] = elComponent.getData();
	        }
	      } else {
	        var childKey = this.childSchemaToKey(element);
	        var child = this.el.querySelector(element.selector);
	        if (child) {
	          var comp = child.components[element.component];
	          if (comp) {
	            var data = comp.getData();
	            compsWithData[childKey] = data;
	          } else {
	            naf.log.write('Could not find component ' + element.component + ' on child ', child, child.components);
	          }
	        }
	      }
	    }
	    return compsWithData;
	  },

	  updateCache: function updateCache(components) {
	    for (var name in components) {
	      this.cachedData[name] = components[name];
	    }
	  },

	  hasTemplate: function hasTemplate() {
	    return this.el.components.hasOwnProperty('template');
	  },

	  updateNextSyncTime: function updateNextSyncTime() {
	    this.nextSyncTime = naf.utils.now() + 1000 / naf.options.updateRate;
	  },

	  networkUpdate: function networkUpdate(data) {
	    var entityData = data.detail.entityData;
	    this.networkUpdateNaked(entityData);
	  },

	  networkUpdateNaked: function networkUpdateNaked(entityData) {
	    if (entityData[0] == 1) {
	      entityData = this.decompressSyncData(entityData);
	    }

	    var el = this.el;

	    if (entityData.template != '') {
	      el.setAttribute('template', 'src:' + entityData.template);
	    }

	    this.updateComponents(entityData.components);
	  },

	  updateComponents: function updateComponents(components) {
	    for (var key in components) {
	      if (this.isSyncableComponent(key)) {
	        var data = components[key];
	        if (this.isChildSchemaKey(key)) {
	          var schema = this.keyToChildSchema(key);
	          var childEl = this.el.querySelector(schema.selector);
	          childEl.setAttribute(schema.component, data);
	        } else {
	          this.el.setAttribute(key, data);
	        }
	      }
	    }
	  },

	  isSyncableComponent: function isSyncableComponent(key) {
	    if (this.isChildSchemaKey(key)) {
	      var schema = this.keyToChildSchema(key);
	      return this.hasChildSchema(schema);
	    } else {
	      return this.data.components.indexOf(key) != -1;
	    }
	  },

	  remove: function remove() {
	    if (this.isMine()) {
	      var data = { networkId: this.data.networkId };
	      naf.connection.broadcastData('r', data);
	    }
	  },

	  hasChildSchema: function hasChildSchema(schema) {
	    var schemaComponents = this.data.components;
	    for (var i in schemaComponents) {
	      var localChildSchema = schemaComponents[i];
	      if (this.childSchemaEqual(localChildSchema, schema)) {
	        return true;
	      }
	    }
	    return false;
	  },

	  childSchemaToKey: function childSchemaToKey(childSchema) {
	    return childSchema.selector + naf.utils.delimiter + childSchema.component;
	  },

	  keyToChildSchema: function keyToChildSchema(key) {
	    var split = key.split(naf.utils.delimiter);
	    return {
	      selector: split[0],
	      component: split[1]
	    };
	  },

	  isChildSchemaKey: function isChildSchemaKey(key) {
	    return key.indexOf(naf.utils.delimiter) != -1;
	  },

	  childSchemaEqual: function childSchemaEqual(a, b) {
	    return a.selector == b.selector && a.component == b.component;
	  }
	});

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var pSlice = Array.prototype.slice;
	var objectKeys = __webpack_require__(58);
	var isArguments = __webpack_require__(59);

	var deepEqual = module.exports = function (actual, expected, opts) {
	  if (!opts) opts = {};
	  // 7.1. All identical values are equivalent, as determined by ===.
	  if (actual === expected) {
	    return true;
	  } else if (actual instanceof Date && expected instanceof Date) {
	    return actual.getTime() === expected.getTime();

	    // 7.3. Other pairs that do not both pass typeof value == 'object',
	    // equivalence is determined by ==.
	  } else if (!actual || !expected || (typeof actual === 'undefined' ? 'undefined' : _typeof(actual)) != 'object' && (typeof expected === 'undefined' ? 'undefined' : _typeof(expected)) != 'object') {
	    return opts.strict ? actual === expected : actual == expected;

	    // 7.4. For all other Object pairs, including Array objects, equivalence is
	    // determined by having the same number of owned properties (as verified
	    // with Object.prototype.hasOwnProperty.call), the same set of keys
	    // (although not necessarily the same order), equivalent values for every
	    // corresponding key, and an identical 'prototype' property. Note: this
	    // accounts for both named and indexed properties on Arrays.
	  } else {
	    return objEquiv(actual, expected, opts);
	  }
	};

	function isUndefinedOrNull(value) {
	  return value === null || value === undefined;
	}

	function isBuffer(x) {
	  if (!x || (typeof x === 'undefined' ? 'undefined' : _typeof(x)) !== 'object' || typeof x.length !== 'number') return false;
	  if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
	    return false;
	  }
	  if (x.length > 0 && typeof x[0] !== 'number') return false;
	  return true;
	}

	function objEquiv(a, b, opts) {
	  var i, key;
	  if (isUndefinedOrNull(a) || isUndefinedOrNull(b)) return false;
	  // an identical 'prototype' property.
	  if (a.prototype !== b.prototype) return false;
	  //~~~I've managed to break Object.keys through screwy arguments passing.
	  //   Converting to array solves the problem.
	  if (isArguments(a)) {
	    if (!isArguments(b)) {
	      return false;
	    }
	    a = pSlice.call(a);
	    b = pSlice.call(b);
	    return deepEqual(a, b, opts);
	  }
	  if (isBuffer(a)) {
	    if (!isBuffer(b)) {
	      return false;
	    }
	    if (a.length !== b.length) return false;
	    for (i = 0; i < a.length; i++) {
	      if (a[i] !== b[i]) return false;
	    }
	    return true;
	  }
	  try {
	    var ka = objectKeys(a),
	        kb = objectKeys(b);
	  } catch (e) {
	    //happens when one is a string literal and the other isn't
	    return false;
	  }
	  // having the same number of owned properties (keys incorporates
	  // hasOwnProperty)
	  if (ka.length != kb.length) return false;
	  //the same set of keys (although not necessarily the same order),
	  ka.sort();
	  kb.sort();
	  //~~~cheap key test
	  for (i = ka.length - 1; i >= 0; i--) {
	    if (ka[i] != kb[i]) return false;
	  }
	  //equivalent values for every corresponding key, and
	  //~~~possibly expensive deep test
	  for (i = ka.length - 1; i >= 0; i--) {
	    key = ka[i];
	    if (!deepEqual(a[key], b[key], opts)) return false;
	  }
	  return (typeof a === 'undefined' ? 'undefined' : _typeof(a)) === (typeof b === 'undefined' ? 'undefined' : _typeof(b));
	}

/***/ },
/* 58 */
/***/ function(module, exports) {

	'use strict';

	exports = module.exports = typeof Object.keys === 'function' ? Object.keys : shim;

	exports.shim = shim;
	function shim(obj) {
	  var keys = [];
	  for (var key in obj) {
	    keys.push(key);
	  }return keys;
	}

/***/ },
/* 59 */
/***/ function(module, exports) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var supportsArgumentsClass = function () {
	  return Object.prototype.toString.call(arguments);
	}() == '[object Arguments]';

	exports = module.exports = supportsArgumentsClass ? supported : unsupported;

	exports.supported = supported;
	function supported(object) {
	  return Object.prototype.toString.call(object) == '[object Arguments]';
	};

	exports.unsupported = unsupported;
	function unsupported(object) {
	  return object && (typeof object === 'undefined' ? 'undefined' : _typeof(object)) == 'object' && typeof object.length == 'number' && Object.prototype.hasOwnProperty.call(object, 'callee') && !Object.prototype.propertyIsEnumerable.call(object, 'callee') || false;
	};

/***/ },
/* 60 */
/***/ function(module, exports) {

	'use strict';

	AFRAME.registerComponent('follow-camera', {
	  camera: {},

	  init: function init() {
	    this.findCamera();
	  },

	  tick: function tick() {
	    if (this.camera) {
	      var position = this.camera.getAttribute('position');
	      var rotation = this.camera.getAttribute('rotation');
	      this.el.setAttribute('position', position);
	      this.el.setAttribute('rotation', rotation);
	    } else {
	      this.findCamera();
	    }
	  },

	  findCamera: function findCamera() {
	    this.camera = document.querySelector('a-camera') || document.querySelector('[camera]');
	  }
	});

/***/ },
/* 61 */
/***/ function(module, exports) {

	'use strict';

	AFRAME.registerComponent('show-child', {
	  schema: {
	    type: 'int',
	    default: 0
	  },

	  update: function update() {
	    this.show(this.data);
	  },

	  show: function show(index) {
	    if (index < this.el.children.length) {
	      this.hideAll();
	      this.el.children[index].setAttribute('visible', true);
	    } else {
	      console.error('show-child@show: invalid index: ', index);
	    }
	  },

	  hideAll: function hideAll() {
	    var el = this.el;
	    for (var i = 0; i < el.children.length; i++) {
	      el.children[i].setAttribute('visible', false);
	    }
	  }
	});

/***/ }
/******/ ]);