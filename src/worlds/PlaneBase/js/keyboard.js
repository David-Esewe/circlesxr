AFRAME.registerComponent('key-handler', {
  schema: {},
  init() {
      const CONTEXT_AF = this;

      // Initial setup, retaining your campfire logic structure
      CONTEXT_AF.socket = null;
      CONTEXT_AF.connected = false;
      CONTEXT_AF.enteredNumberEventName = "enteredNumber_event";
      CONTEXT_AF.campfireLinkVisibilityEventName = "campfireLinkVisibility_event";
      CONTEXT_AF.clearEnteredSequenceEventName = "clearEnteredSequence_event"; // New event name for clearing the sequence

      // Stores the entered sequence for synchronization
      CONTEXT_AF.enteredSequence = "";

      CONTEXT_AF.createNetworkingSystem = function () {
          CONTEXT_AF.socket = CIRCLES.getCirclesWebsocket();
          CONTEXT_AF.connected = true;
          console.warn("Messaging system connected at socket: " + CONTEXT_AF.socket.id + " in room: " + CIRCLES.getCirclesGroupName() + ' in world: ' + CIRCLES.getCirclesWorldName());

          document.querySelectorAll('.key').forEach((key) => {
              key.addEventListener('click', () => {
                  const value = key.getAttribute('data-value');
                  CONTEXT_AF.enteredSequence += value;
                  document.querySelector('#enteredNumbersDisplay').setAttribute('value', CONTEXT_AF.enteredSequence);
                  CONTEXT_AF.socket.emit(CONTEXT_AF.enteredNumberEventName, {sequence: CONTEXT_AF.enteredSequence, room: CIRCLES.getCirclesGroupName(), world: CIRCLES.getCirclesWorldName()});
              });
          });

          document.querySelector('#enterKey').addEventListener('click', () => {
              if (CONTEXT_AF.enteredSequence === '1924') {
                  let visibility = true;
                  var sound1 = document.querySelector('#correct');
                    sound1.components.sound.playSound();
                  document.querySelector('#campfire_link').setAttribute('visible', visibility);
                  CONTEXT_AF.socket.emit(CONTEXT_AF.campfireLinkVisibilityEventName, {visible: visibility, room: CIRCLES.getCirclesGroupName(), world: CIRCLES.getCirclesWorldName()});
              }
              else{
                var sound = document.querySelector('#incorrect');
                sound.components.sound.playSound();
              }
              // Emit the clear sequence event regardless of the sequence being correct
              CONTEXT_AF.socket.emit(CONTEXT_AF.clearEnteredSequenceEventName, {room: CIRCLES.getCirclesGroupName(), world: CIRCLES.getCirclesWorldName()});
              CONTEXT_AF.enteredSequence = ""; // Reset the sequence
              document.querySelector('#enteredNumbersDisplay').setAttribute('value', CONTEXT_AF.enteredSequence);
          });

          // Listen for sequence updates from other users
          CONTEXT_AF.socket.on(CONTEXT_AF.enteredNumberEventName, function(data) {
              CONTEXT_AF.enteredSequence = data.sequence;
              document.querySelector('#enteredNumbersDisplay').setAttribute('value', data.sequence);
          });

          // Listen for campfire link visibility changes
          CONTEXT_AF.socket.on(CONTEXT_AF.campfireLinkVisibilityEventName, function(data) {
              document.querySelector('#campfire_link').setAttribute('visible', data.visible);
          });

          // Listen for the clear sequence command from other users
          CONTEXT_AF.socket.on(CONTEXT_AF.clearEnteredSequenceEventName, function() {
              CONTEXT_AF.enteredSequence = "";
              document.querySelector('#enteredNumbersDisplay').setAttribute('value', "");
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
