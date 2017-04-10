AFRAME.registerComponent('teleporter', {
  init: function () {
    var el = this.el,
        data = this.data,
        camera = this.findCamera(),
        movePlayer = this.movePlayer;

    console.log('We got a teleporter!');

    el.addEventListener('click', function () {
      console.log('You want to move!');
      var teleporterPos = el.getAttribute('position'),
          cameraPos = camera.getAttribute('position'),
          desiredPos;

      desiredPos = teleporterPos;
      desiredPos.y = cameraPos.y; // Keep to user height

      camera.setAttribute('animation', desiredPos);

      console.log(desiredPos);

      movePlayer(camera, desiredPos);
    });
  },
  play: function() {
    var el = this.el;

    el.addEventListener('collide', function (evt) {
      if (evt.detail.body.el.getAttribute('class') == 'avatar') {
        console.log('Teleporter is taken');

        //el.setAttribute('material', 'opacity: 0');
      } else {
        console.log('Nothing colliding!', evt);
      }
    });
  },
  movePlayer: function(camera, pos) {
    var stringPos = pos.x + ' ' + pos.y + ' ' + pos.z,
        rand = Math.random();
    console.log(stringPos);
    camera.setAttribute('animation', {
      property: 'position',
      dur: 1000,
      to: stringPos,
      startEvents: 'movePlayer'+rand
    });

    camera.emit('movePlayer'+rand);
  },
  findCamera: function() {
    return document.querySelector('a-camera') || document.querySelector('[camera]');
  }
});