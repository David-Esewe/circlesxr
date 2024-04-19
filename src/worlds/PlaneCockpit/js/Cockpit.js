window.addEventListener('click', function () { 
    document.querySelector('#PlaneFront').play();
    document.querySelector('#radar').play();
  
  });

var speed = 50; // Global speed variable
var altitude = 50; 

document.addEventListener('DOMContentLoaded', function() {
    var speedText = document.querySelector('#Speed');
    var buttonUp = document.querySelector('#ButtonUp');
    var buttonDown = document.querySelector('#ButtonDown');

    buttonUp.addEventListener('click', function() {
        if (speed < 250) {
            speed= speed + 50;
            speedText.setAttribute('value', speed);
        }
    });

    buttonDown.addEventListener('click', function() {
        if (speed > 50) {
            speed = speed - 50;
            speedText.setAttribute('value', speed);
        }
    });
});



document.addEventListener('DOMContentLoaded', function() {
    var speedText = document.querySelector('#Altitude');
    var buttonUp = document.querySelector('#AltButtonUp');
    var buttonDown = document.querySelector('#AltButtonDown');

    buttonUp.addEventListener('click', function() {
        if (speed < 250) {
            speed= speed + 50;
            speedText.setAttribute('value', speed);
        }
    });

    buttonDown.addEventListener('click', function() {
        if (speed > 50) {
            speed = speed - 50;
            speedText.setAttribute('value', speed);
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    var landButton = document.querySelector('#Land');
    var planeFront = document.querySelector('#flying');
    var planeSide = document.querySelector('#landing');
    var Lablink = document.querySelector('#Lablink');

    landButton.addEventListener('click', function() {
      window.addEventListener('click', function () { 
     
        // Hide the front videosphere and show the side videosphere
        var sound = document.querySelector('#correct');
        sound.components.sound.playSound();
        planeFront.setAttribute('visible', false);
        planeSide.setAttribute('visible', true);
        Lablink.setAttribute('visible', true);
        document.querySelector('#PlaneSide').play();
        planeSide.play();
      });
    });
});


  AFRAME.registerComponent('toggle-animation', {
    schema: {
      isOn: {type: 'boolean', default: false}
    },
    init: function() {
      this.el.addEventListener('click', () => {
        // Toggle the animation state
        this.data.isOn = !this.data.isOn;
        if (this.data.isOn) {
          this.el.setAttribute('animation-mixer', 'clip: On; loop: once; clampWhenFinished: true');
        } else {
          this.el.setAttribute('animation-mixer', 'clip: Off; loop: once; clampWhenFinished: true ');
        }
      });
    }
  });
