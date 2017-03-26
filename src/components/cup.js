AFRAME.registerComponent('cup', {
  init: function () {
    var el = this.el;

    console.log('Cup has arrived', el);

    var c = document.createElement('a-entity');
        c.setAttribute('scale', '0.06 0.06 0.06');
        c.setAttribute('position', '0 -0.02 0');
        c.setAttribute('obj-model', 'obj: #cup-obj; mtl: #cup-mtl');
        el.appendChild(c);

    var liquid = document.createElement('a-entity');
        liquid.setAttribute('scale', '0.06 0 0.06');
        liquid.setAttribute('class', 'liquid');
        liquid.setAttribute('position', '0 -0.02 0');
        liquid.setAttribute('material', 'color: #fff; visible: false;');
        liquid.setAttribute('obj-model', 'obj: #liquid-obj;');
        el.appendChild(liquid);
  }
});