AFRAME.registerComponent('alien', {
  cupHolder: false,
  chosenCup: false,
  init: function () {
    var el = this.el;
    this.cupHolder = el.querySelector('.coffee-holder');
    this.chosenCup = false;

    /*
    ATTEMPT TO GET HOLDING CUP... didn't work

    var holdingCup = document.createElement('a-entity');
    holdingCup.setAttribute('cup', '');
    holdingCup.setAttribute('class', 'cup');
    holdingCup.setAttribute('mixin', 'cup');
    el.appendChild(holdingCup);
    */

    console.log('Alien ready', el);
  },
  play: function () {
    var alienAvatar = this,
        el = this.el;

    /*el.addEventListener('hit', function (evt) {
      if (evt.detail.el) {
        console.log('HIT!', evt);
      }
    });*/

    el.addEventListener('stateadded', function (evt) {
      if (evt.detail.state) {
        console.log('Alien State is: ', evt.detail.state);
      }
    });

    el.addEventListener('stateremoved', function (evt) {
      if (evt.detail.state) {
        console.log('Alien State was: ', evt.detail.state);
      }
    });

    el.addEventListener('collide', function (evt) {
      if (evt.detail.body.el.getAttribute('class') == 'cup') {
        if (evt.detail.body.el.querySelector('.liquid')) {
          var scaleVal = evt.detail.body.el.querySelector('.liquid').getAttribute('scale');
          
          if (scaleVal.y != 0) {
            alienAvatar.chooseCup(evt.detail.body.el);
            el.components.sound.playSound();
            evt.detail.body.el.querySelector('.liquid').setAttribute('scale', '0.06 0 0.06');
            evt.detail.body.el.querySelector('.liquid').setAttribute('material', 'color: #fff; visible: false;');
          }
        }
        
        //console.log('Hit something', evt.detail.body.el);
      }
    });
  },
  chooseCup: function(cupElem) {
    if (!this.cupHolder) this.cupHolder = el.querySelector('.coffee-holder');
    if (!this.chosenCup) {
      this.chosenCup = cupElem;
      //if (this.cupHolder) this.cupHolder.appendChild(evt.detail.body.el);
      console.log('Oh, it was a cup', this.chosenCup);
      //evt.detail.body.el.setAttribute('visible', 'false');
      
      
    }
  },
  tick: function() {
    //console.log(this.cupHolder, this.chosenCup);
    //if (this.chosenCup) console.log('CUP: ', this.cupHolder, this.chosenCup);
    if (this.cupHolder && this.chosenCup) {
      //this.cupHolder.appendChild(this.chosenCup);
      //var position = this.cupHolder.getAttribute('position');
      //var rotation = this.cupHolder.getAttribute('rotation');
      //console.log(position, rotation);
      //this.chosenCup.setAttribute('position', position);
      //this.chosenCup.setAttribute('rotation', rotation);
    }
  }
});