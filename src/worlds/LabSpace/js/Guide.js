document.addEventListener('DOMContentLoaded', function () {
    const modelEntity = document.getElementById('Pager');
    const soundEffect = document.getElementById('soundEffect');
  
    // Function to play animation and sound
    function playAnimationAndSound() {
      // Play sound
      soundEffect.play().catch(e => console.error('Error playing sound:', e));
  
      modelEntity.setAttribute('animation-mixer', {clip: '*', loop: 'once', clampWhenFinished: true});
    }
  
    // Add event listener for click to play sound and animation
    modelEntity.addEventListener('click', playAnimationAndSound);
  });
  