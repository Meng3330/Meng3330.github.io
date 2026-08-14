/* ============================================
   Header — 滚动毛玻璃效果
   ============================================ */

(function() {
  'use strict';

  var header = document.getElementById('stardust-header');
  if (!header) return;

  var ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(function() {
        if (window.scrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* Set initial state */
  onScroll();

  /* Hero scroll hint */
  var scrollHint = document.querySelector('.hero-scroll-hint');
  if (scrollHint) {
    scrollHint.addEventListener('click', function() {
      var target = document.getElementById('home-content');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
})();
