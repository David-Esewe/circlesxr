
window.appState = {
    harvestedCrops: 0
    
};

AFRAME.registerComponent('trigger-animation-on-click', {
    schema: {
        currentState: {type: 'string', default: 'Default'},
        id: {type: 'string'},  // Unique identifier for each entity using this component
        truckCapacity: {type: 'number', default: 20}
    },
    
    init: function() {
        const CONTEXT_AF = this;

        // Setup for networking and animation debouncing
        CONTEXT_AF.socket = null
        CONTEXT_AF.connected = false
        CONTEXT_AF.animationChangeEventName = "animationChange_event";
        CONTEXT_AF.toolStateChangeEventName = "toolStateChange_event";
    
        CONTEXT_AF.createNetworkingSystem = function () {
            CONTEXT_AF.socket = CIRCLES.getCirclesWebsocket();
            CONTEXT_AF.connected = true;
            console.warn("Messaging system connected at socket: " + CONTEXT_AF.socket.id+ " in room: " + CIRCLES.getCirclesGroupName() + ' in world: ' + CIRCLES.getCirclesWorldName());
        // Set up networking system and listeners
       
        this.el.addEventListener('click', () => {
           
            const toolHeld = CONTEXT_AF.getHeldTool();
        
            if (toolHeld !== 'None') {
                this.handleAnimationChange(toolHeld);
                
                console.log('Clicked without any tool picked up, doing nothing.');
                return;
            }

            const targetAnimation = CONTEXT_AF.determineTargetAnimation(toolHeld);
            if (targetAnimation && targetAnimation !== CONTEXT_AF.data.currentState) {
                CONTEXT_AF.setAnimation(targetAnimation, false);
                CONTEXT_AF.socket.emit(CONTEXT_AF.animationChangeEventName, {
                    animation: targetAnimation,
                    id: CONTEXT_AF.data.id,
                    room: CIRCLES.getCirclesGroupName(),
                    world: CIRCLES.getCirclesWorldName()
                });
            } else {
                console.log('No valid transition found or animation already playing.');
            }
        });
            CONTEXT_AF.socket.on(CONTEXT_AF.animationChangeEventName, function(data) {
                if (data.id === CONTEXT_AF.data.id) {
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
        }
        else {
            const wsReadyFunc = function() {
                CONTEXT_AF.init(); // Reinitialize once WebSocket is ready
                CONTEXT_AF.el.sceneEl.removeEventListener(CIRCLES.EVENTS.WS_CONNECTED, wsReadyFunc);
            };
            CONTEXT_AF.el.sceneEl.addEventListener(CIRCLES.EVENTS.WS_CONNECTED, wsReadyFunc);
            return; // Exit if not connected yet
        }
        // Set the default animation
        CONTEXT_AF.setAnimation('Default', false);

        // Handle clicks and tool interactions
        
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

    handleTruckInteraction: function() {
        const truck = document.querySelector('#Truck');
        truck.addEventListener('click', () => {
            if (window.appState.harvestedCrops > 0 && this.data.truckCapacity >= window.appState.harvestedCrops) {
                this.data.truckCapacity -= window.appState.harvestedCrops;
                console.log(`Transferred ${window.appState.harvestedCrops} crops to the truck. Remaining truck capacity: ${this.data.truckCapacity}`);
                window.appState.harvestedCrops = 0;
                this.updateTruckCapacityUI();
            } else {
                console.log("Truck is full or there are no crops to transfer.");
            }
        });
    },
    setAnimation: function(animationName, shouldLoop) {
        this.el.setAttribute('animation-mixer', {
            clip: animationName,
            loop: shouldLoop ? 'repeat' : 'once',
            clampWhenFinished: true
        });
        this.data.currentState = animationName;
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
        if (tool === 'Trowel' && this.data.currentState === 'Default') return 'Sprout';
        if (tool === 'Watercan' && this.data.currentState === 'Sprout') return 'Grow';
        if (tool === 'Bucket' && this.data.currentState === 'Grow') return 'Default';
        return null;
    },

    update: function () {
        // This method is called whenever the component's data is updated.
        this.updateTruckCapacityUI();
    },
    // updateHarvestedCropsUIVisibility: function() {
    //     const currentTool = this.getHeldTool();
    //     // const displayState = currentTool === 'Bucket' ? 'block' : 'none';
    //     document.getElementById('harvested-crops-ui').style.display = displayState;
    // },

    handleAnimationChange: function(tool) {
        const targetAnimation = this.determineTargetAnimation(tool);
        if (targetAnimation) {
            if (tool === 'Bucket' && targetAnimation === 'Default') {
                if (window.appState.harvestedCrops < 5) {
                    window.appState.harvestedCrops++;
                    console.log(`Harvested crops: ${window.appState.harvestedCrops}`);
                    
                } else {
                    console.log("Need to unload crops at the truck.");
                    return; // Skip setting the animation if crops need to be unloaded
                }
            }
         
                this.setAnimation(targetAnimation, false);
           
        }
    }
});

