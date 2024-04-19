
window.appState = {
    harvestedCrops: 0,
    Win: false
};



// File: script.js
document.addEventListener('click', function(event) {
    if (window.appState.harvestedCrops === 5) { 
        
        var sound = document.querySelector('#Bucket');
        sound.components.sound.playSound();
    }

   if (window.appState.win === true){
    const linkContainer = document.getElementById('Lablink');
    linkContainer.setAttribute('visible', true);
    var sound = document.querySelector('#correct');
    sound.components.sound.playSound();
   }
});

AFRAME.registerComponent('trigger-animation-on-click', {
    schema: {
        currentState: {type: 'string', default: 'Default'},
        id: {type: 'string'},
        truckCapacity: {type: 'number', default: 20}
    },
    init: function() {
        const CONTEXT_AF = this;
        const scene      = document.querySelector('a-scene');
        CONTEXT_AF.socket = null;
        CONTEXT_AF.connected = false;
        CONTEXT_AF.animationChangeEventName = "animationChange_event";
        CONTEXT_AF.toolStateChangeEventName = "toolStateChange_event";

        CONTEXT_AF.LabLink          = scene.querySelector('#Lablink');

        CONTEXT_AF.createNetworkingSystem = function () {
            CONTEXT_AF.socket = CIRCLES.getCirclesWebsocket();
            CONTEXT_AF.connected = true;
            console.warn("Messaging system connected at socket: " + CONTEXT_AF.socket.id);

            this.el.addEventListener('click', () => {
                this.updateBucketUI();
                const toolHeld = CONTEXT_AF.getHeldTool();
                const targetAnimation = CONTEXT_AF.determineTargetAnimation(toolHeld);
                if (toolHeld === 'None') {
                    this.handleAnimationChange(toolHeld);
                    console.log('Clicked without any tool picked up, doing nothing.');
                    return;
                }
               
                if (toolHeld === 'Bucket' && targetAnimation === 'Harvest') {
                    if (window.appState.harvestedCrops < 5) {
                        window.appState.harvestedCrops++;
                        this.updateBucketUI();
                        console.log(`Harvested crops: ${window.appState.harvestedCrops}`);
                        
                    } else {
                        this.playSound();
                        console.log("Need to unload crops at the truck.");
                        
                        return; // Skip setting the animation if crops need to be unloaded
                    }
                }
             
                
                if (targetAnimation && targetAnimation !== CONTEXT_AF.data.currentState) {
                    CONTEXT_AF.setAnimation(targetAnimation, false);
                    console.log(`Transitioning to ${targetAnimation} animation.`);
                    // Emit the animation change to all connected users with the ID of this entity
                    CONTEXT_AF.socket.emit(CONTEXT_AF.animationChangeEventName, {
                        animation: targetAnimation,
                        id: CONTEXT_AF.data.id,  // Include the ID of this entity in the emitted data
                        room: CIRCLES.getCirclesGroupName(),
                        world: CIRCLES.getCirclesWorldName()
                    });
                } else {
                    console.log('No valid transition found or animation already playing.');
                }
            });
    
            // Listen for animation changes specific to this entity
            CONTEXT_AF.socket.on(CONTEXT_AF.animationChangeEventName, function(data) {
                if (data.id === CONTEXT_AF.data.id) {  // Check if the update is for this particular entity
                    CONTEXT_AF.setAnimation(data.animation, false);
                }
            });
            CONTEXT_AF.socket.on(CONTEXT_AF.toolStateChangeEventName, function(data) {
                const toolElement = document.querySelector('#' + data.toolId);
                if (toolElement) {
                    toolElement.components['circles-pickup-object'].pickedUp = data.pickedUp;
                    console.log(`${data.toolId} picked up state changed to ${data.pickedUp}`);
                }
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

        CONTEXT_AF.setAnimation('Default', false);
        
       


        
         
        this.handleTruckInteraction();
    },

    
    updateTruckCapacityUI: function() {
        // Get the element with the truck capacity
        var uiElement = document.getElementById('truck-capacity-display');
        if (uiElement) {
            // Set the text content to the current value of truckCapacity
            uiElement.textContent = this.data.truckCapacity;
        }
    },
 
    updateBucketUI: function() {
        // Get the element with the truck capacity
        var uiElement = document.getElementById('harvested-crops-count');
        if (uiElement) {
            // Set the text content to the current value of truckCapacity
            uiElement.textContent = window.appState.harvestedCrops;
        }
    },
    update: function () {
        // This method is called whenever the component's data is updated.
        this.updateTruckCapacityUI();
    },
   
    handleTruckInteraction: function() {
       
        
        const truck = document.querySelector('#Truck');

        truck.addEventListener('click', () => {
            if (window.appState.harvestedCrops > 0 && this.data.truckCapacity >= window.appState.harvestedCrops) {
                this.data.truckCapacity -= window.appState.harvestedCrops;
                console.log(`Transferred ${window.appState.harvestedCrops} crops to the truck. Remaining truck capacity: ${this.data.truckCapacity}`);
                window.appState.harvestedCrops = 0;
                this.updateTruckCapacityUI();
                this.updateBucketUI();
            } else {
                
                console.log("Truck is full or there are no crops to transfer.");
            }

            if(this.data.truckCapacity === 0){
                window.appState.win = true;
            
            }
        });
    },
    
    playSound: function() {
        var sound = document.querySelector('#Bucket');
        sound.components.sound.playSound();
    },
    
    setAnimation: function(animationName, shouldLoop) {
        // Set and play the animation based on the name and looping preference.
        this.el.setAttribute('animation-mixer', {
            clip: animationName,
            loop: shouldLoop ? 'repeat' : 'once',
            clampWhenFinished: true
        });
        this.data.currentState = animationName;  // Update the current state
    },

    getHeldTool: function() {
        const tools = ['Trowel', 'Bucket', 'Watercan'];
               for (let toolId of tools) {
                   const toolElement = document.querySelector('#' + toolId);
                   if (toolElement && toolElement.components['circles-pickup-object'].pickedUp) {
                       return toolId;  // Return the first tool that is held
                   }
               }
               
               return 'None';  // Return 'None' if no tools are picked up
           },
           
    determineTargetAnimation: function(tool) {
            // Determine the target animation based on the current tool and state.
            if (tool === 'Trowel' && (this.data.currentState === 'Default' || this.data.currentState === 'Harvest')) return 'Sprout';
            if (tool === 'Watercan' && this.data.currentState === 'Sprout') return 'Grow';
            if (tool === 'Bucket' && this.data.currentState === 'Grow') return 'Harvest';
            return null;
        },

        
    handleAnimationChange: function(tool) {
        const targetAnimation = this.determineTargetAnimation(tool);
        if (targetAnimation) {
            if (tool === 'Bucket' && targetAnimation === 'Harvest') {
                if (window.appState.harvestedCrops < 5) {
                    window.appState.harvestedCrops++;
                    console.log(`Harvested crops: ${window.appState.harvestedCrops}`);
                    
                } else {
                    this.playSound();
                    console.log("Need to unload crops at the truck.");
                  
                    return; // Skip setting the animation if crops need to be unloaded
                }
            }
         
                this.setAnimation(targetAnimation, false);
           
        }
    }
    
});

