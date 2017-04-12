AFRAME.registerComponent('follow-feet', {
  camera: {},

  init: function() {
    this.findCamera();
  },

  tick: function() {
    if (this.camera) {
      var position = this.camera.getAttribute('position');
      var thisPosition = this.el.getAttribute('position');
      this.el.setAttribute('position', {x: position.x, y: thisPosition.y, z: position.z});
    } else {
      this.findCamera();
    }
  },

  findCamera: function() {
    this.camera = document.querySelector('a-camera') || document.querySelector('[camera]');
  }
});