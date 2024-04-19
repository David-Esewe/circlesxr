'use strict';
window.correctButtonsState = {
  totalCorrect: 0, // Total number of correct buttons
  pressedCorrect: 0, // Number of correctly pressed buttons
};

AFRAME.registerComponent('circles-button-press', {
  schema: {
    type: {type:'string', default:'box', oneOf:['box', 'cylinder']},
    button_color: {type:'color', default:'rgb(255, 100, 100)'},
    button_color_hover: {type:'color', default:'rgb(255, 0, 0)'},
    button_color_press: {type:'color', default:'rgb(0, 255, 0)'},
    pedastal_color: {type:'color', default:'rgb(255, 255, 255)'},
    diameter: {type:'number', default:0.5},
    pedastal_visible: {type:'boolean', default:true},
    isCorrect: {type: 'boolean', default: false}
  },
  init: function () {
    const CONTEXT_AF = this;
    
    
    CONTEXT_AF.pressed = false;
    CONTEXT_AF.button = document.createElement('a-entity');
    CONTEXT_AF.button.classList.add('button', 'interactive');
    
    CONTEXT_AF.button.setAttribute('position', {x:0, y:0, z:0.1});
    CONTEXT_AF.button.setAttribute('rotation', {x:90, y:90, z:90});
    CONTEXT_AF.button.setAttribute('geometry', {primitive: 'cylinder', radius: 0.17, height: 0.2});
    CONTEXT_AF.button.setAttribute('material', {color: this.data.button_color});
    CONTEXT_AF.el.appendChild(CONTEXT_AF.button);
  
    // Define event listeners as named functions for proper removal
    
  
    const onClick = () => {
      // Mark the button as pressed to prevent future color changes on hover/leave
      CONTEXT_AF.button.setAttribute('pressed', true);
      if (CONTEXT_AF.button.getAttribute('pressed') === 'true') {
        var sound = document.querySelector('#press');
        sound.components.sound.playSound();
        CONTEXT_AF.button.setAttribute('material', 'color', 'rgb(0, 255, 0)');
        CONTEXT_AF.button.setAttribute('position', {x:0, y:0, z:0.05});
    }
      // Remove hover and leave listeners to prevent changing color back
      const isCorrect = CONTEXT_AF.el.getAttribute('data-is-correct') === 'true';

      if (CONTEXT_AF.data.isCorrect) {
        window.correctButtonsState.pressedCorrect++;
        console.log('A correct button was pressed.');
      } else {
        window.correctButtonsState.pressedCorrect--;
        console.log('An incorrect button was pressed.');
      }

    };
  
    // Attach event listeners
    CONTEXT_AF.button.addEventListener('click', onClick);
  },

});

AFRAME.registerComponent('reset-buttons', {
  init: function() {
    const CONTEXT_AF = this; // Adjusted to use var for function scope
    const scene      = document.querySelector('a-scene');
    CONTEXT_AF.link_1 = scene.querySelector('#link_1');
    //CONTEXT_AF.socket = null;
    CONTEXT_AF.connected = false;
    CONTEXT_AF.campfireLinkVisibilityEventName = "campfireLinkVisibility_event";

    CONTEXT_AF.createNetworkingSystem = function () {
      CONTEXT_AF.socket = CIRCLES.getCirclesWebsocket();
      CONTEXT_AF.connected = true;
      console.warn("Messaging system connected at socket: " + CONTEXT_AF.socket.id + " in room: " + CIRCLES.getCirclesGroupName() + ' in world: ' + CIRCLES.getCirclesWorldName());
    

    // Moved the event listener to the correct scope
    this.el.addEventListener('click', function() {
      const allButtons = document.querySelectorAll('[circles-button-press]');
      let winCondition = true; // Assume win to start with
      
      // If no correct button was pressed, set win condition to false
      if (window.correctButtonsState.pressedCorrect === 4) {
        var sound = document.querySelector('#correct');
        sound.components.sound.playSound();
        winCondition = true;
        let visibility = true;
        CONTEXT_AF.link_1.setAttribute('class', 'interactive');
        document.querySelector('#plane_link').setAttribute('visible', visibility);
        CONTEXT_AF.socket.emit(CONTEXT_AF.campfireLinkVisibilityEventName, {visible: true, room: CIRCLES.getCirclesGroupName(), world: CIRCLES.getCirclesWorldName()});
      } else {
        var sound = document.querySelector('#incorrect');
        sound.components.sound.playSound();
        winCondition = false;
      }
    
      // Output result based on win condition
      console.log(window.correctButtonsState.pressedCorrect);
      console.log(winCondition ? 'You win!' : 'Try again');

     
      // Reset buttons after checking win condition
      window.correctButtonsState.pressedCorrect = 0;
      allButtons.forEach(function(entity) {
        const comp = entity.components['circles-button-press'];
        if (comp && comp.button) {
          comp.button.object3D.position.z = 0.1; // Reset position
          comp.button.setAttribute('material', 'color', comp.data.button_color); // Reset color
          comp.pressed = false; // Reset pressed state
        }
      });
      
    });
    CONTEXT_AF.socket.on(CONTEXT_AF.campfireLinkVisibilityEventName, function(data) {
      document.querySelector('#plane_link').setAttribute('visible',true);
  });
    };
      if (CIRCLES.isCirclesWebsocketReady()) {
        CONTEXT_AF.createNetworkingSystem();
      } else {
        const wsReadyFunc = function() {
            CONTEXT_AF.createNetworkingSystem();
            CONTEXT_AF.el.sceneEl.removeEventListener(CIRCLES.EVENTS.WS_CONNECTED, wsReadyFunc);
        };
        CONTEXT_AF.el.sceneEl.addEventListener(CIRCLES.EVENTS.WS_CONNECTED, wsReadyFunc);
      }
    
  },
  update() {},
});

