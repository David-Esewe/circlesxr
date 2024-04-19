AFRAME.registerComponent('keyboard-button', {
    schema: {
      type: {type:'string', default:'box', oneOf:['box', 'cylinder']},
      button_color: {type:'color', default:'rgb(128, 128, 128)'},
      button_color_hover: {type:'color', default:'rgb(255, 0, 0)'},
      button_color_press: {type:'color', default:'rgb(0, 255, 0)'},
      pedastal_color: {type:'color', default:'rgb(255, 255, 255)'},
      diameter: {type:'number', default:0.5},
      pedastal_visible: {type:'boolean', default:true},
      isCorrect: {type: 'boolean', default: false}
    },
    init: function () {
      const CONTEXT_AF = this;
     
      CONTEXT_AF.button = document.createElement('a-entity');
      CONTEXT_AF.button.classList.add('button', 'interactive');
      CONTEXT_AF.button.setAttribute('position', {x:0, y:0, z:0.1});
      CONTEXT_AF.button.setAttribute('rotation', {x:0, y:180, z:0});
      CONTEXT_AF.button.setAttribute('geometry', {primitive: 'box', width: 0.3, depth:0.1, height: 0.3});
      CONTEXT_AF.button.setAttribute('material', {color: this.data.button_color});
      CONTEXT_AF.button.setAttribute('animation__mouseenter', {property:'material.color', type:'color', to:'rgb(255, 0, 0)', startEvents:'mouseenter', dur:200});
      CONTEXT_AF.button.setAttribute('animation__mouseleave', {property:'material.color', type:'color', to:'rgb(128, 128, 128)', startEvents:'mouseleave', dur:200});
      CONTEXT_AF.button.setAttribute('animation__click', {property:'position.z', from:0.05, to:0.1, startEvents:'click', dur:300});
      CONTEXT_AF.button.setAttribute('animation__click_color', {property:'material.color', type:'color', to:'rgb(0, 255, 0)', startEvents:'click', dur:0});
      CONTEXT_AF.el.appendChild(CONTEXT_AF.button);
    
      // Define event listeners as named functions for proper removal
      
    
    }
  
  });
  
  AFRAME.registerComponent('keyboard-enter', {
    schema: {
      type: {type:'string', default:'box', oneOf:['box', 'cylinder']},
      button_color: {type:'color', default:'rgb(255, 0, 0)'},
      button_color_hover: {type:'color', default:'rgb(255, 0, 0)'},
      button_color_press: {type:'color', default:'rgb(0, 255, 0)'},
      pedastal_color: {type:'color', default:'rgb(255, 255, 255)'},
      diameter: {type:'number', default:0.5},
      pedastal_visible: {type:'boolean', default:true},
      isCorrect: {type: 'boolean', default: false}
    },
    init: function () {
      const CONTEXT_AF = this;
     
      CONTEXT_AF.button = document.createElement('a-entity');
      CONTEXT_AF.button.classList.add('button', 'interactive');
      CONTEXT_AF.button.setAttribute('position', {x:0, y:0, z:0.1});
      CONTEXT_AF.button.setAttribute('rotation', {x:0, y:180, z:0});
      CONTEXT_AF.button.setAttribute('geometry', {primitive: 'box', width: 1, depth:0.1, height: 0.5});
      CONTEXT_AF.button.setAttribute('material', {color: this.data.button_color});
      CONTEXT_AF.button.setAttribute('animation__mouseenter', {property:'material.color', type:'color', to:'rgb(255, 0, 0)', startEvents:'mouseenter', dur:200});
      CONTEXT_AF.button.setAttribute('animation__mouseleave', {property:'material.color', type:'color', to:'rgb(255, 0,0)', startEvents:'mouseleave', dur:200});
      CONTEXT_AF.button.setAttribute('animation__click', {property:'position.z', from:0.05, to:0.1, startEvents:'click', dur:300});
      CONTEXT_AF.button.setAttribute('animation__click_color', {property:'material.color', type:'color', to:'rgb(0, 255, 0)', startEvents:'click', dur:50});
      CONTEXT_AF.el.appendChild(CONTEXT_AF.button);
    
      // Define event listeners as named functions for proper removal
      
    
    }
  
  });
  