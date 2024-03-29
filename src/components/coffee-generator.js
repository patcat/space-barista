AFRAME.registerComponent('coffee-generator', {
  init: function () {
    var el = this.el;

    console.log('Coffee generator ready', el);

    /*var c = document.createElement('a-entity');
        c.setAttribute('scale', '0.06 0.06 0.06');
        c.setAttribute('position', '0 -0.02 0');
        c.setAttribute('obj-model', 'obj: #cup-obj; mtl: #cup-mtl');
        el.appendChild(c);*/
  }
});

AFRAME.registerComponent('coffee', {
  init: function () {
    var el = this.el;

    console.log('Coffee ready', el.getAttribute('material'));

    /*var c = document.createElement('a-entity');
        c.setAttribute('scale', '0.06 0.06 0.06');
        c.setAttribute('position', '0 -0.02 0');
        c.setAttribute('obj-model', 'obj: #cup-obj; mtl: #cup-mtl');
        el.appendChild(c);*/
  },

  play: function () {
    var el = this.el;

    el.addEventListener('drag-drop', function (evt) {
      console.log('I GATCHA CAUFEEEEEEEE', evt.detail);

      console.log(el.getAttribute('material', 'color'));

      var colliderObj = evt.detail.dropped.querySelector('.liquid');

      if (colliderObj) {
        colliderObj.setAttribute('scale', '0.06 0.06 0.06');
        colliderObj.setAttribute('material', 'color: #502F00; visible: true');
        
        el.components.sound.playSound();
      }
    });
  }
});