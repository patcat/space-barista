AFRAME.registerComponent('order-button', {
  init: function () {
    var el = this.el,
        data = this.data,
        toggle = el.querySelector('.order-button-toggle');

    console.log('We got an order button!', toggle);
  }
});

AFRAME.registerComponent('order-button-toggle', {
  init: function () {
    var el = this.el,
        data = this.data,
        buttonHolder = this.el.parentNode,
        initialPosition = el.getAttribute('position');

    if (el.getAttribute('position') == '0 0 0') {
      el.setAttribute('pressed', true);
    } else {
      el.setAttribute('pressed', false);
    }
    

    el.addEventListener('click', function () {
      pressed = el.getAttribute('pressed');

      console.log('Order button pressed: ', pressed);

      if (pressed != "true" || !pressed) {
        el.setAttribute('pressed', 'true');
        el.setAttribute('position', '0 0 0');
      } else {
        el.setAttribute('pressed', 'false');
        el.setAttribute('position', '0 ' + initialPosition.y + ' 0');
      }
    });
  }
});