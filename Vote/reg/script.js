<script>
  // Animate vote count when the element becomes visible
  (() => {
    const voteDisplay = document.getElementById('voteCount');
    if (!voteDisplay) return;

    const finalCount = 745;        // Desired vote count
    const animationDuration = 1400; // In milliseconds
    let animationStartTime = null;

    const animateCount = (timestamp) => {
      if (!animationStartTime) animationStartTime = timestamp;

      const progress = Math.min((timestamp - animationStartTime) / animationDuration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3); // Ease-out cubic easing

      voteDisplay.textContent = Math.floor(easedProgress * finalCount).toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };

    // Use IntersectionObserver to trigger animation only when the element is visible
    const observer = new IntersectionObserver((entries, observerInstance) => {
      const isVisible = entries.some(entry => entry.isIntersecting);
      if (isVisible) {
        requestAnimationFrame(animateCount);
        observerInstance.disconnect(); // Stop observing once animation has started
      }
    }, { threshold: 0.4 });

    observer.observe(voteDisplay);
  })();

  // Add subtle 3D tilt effect on mouse move for polaroid-style cards
  (() => {
    const polaroidCards = document.querySelectorAll('.polaroid');
    const maxRotation = 8; // Maximum tilt in degrees

    polaroidCards.forEach(card => {
      card.addEventListener('mousemove', (event) => {
        const bounds = card.getBoundingClientRect();
        const offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
        const offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;

        const rotateX = (-offsetY * maxRotation).toFixed(2);
        const rotateY = (offsetX * maxRotation).toFixed(2);

        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = ''; // Reset transform on mouse leave
      });
    });
  })();
</script>
