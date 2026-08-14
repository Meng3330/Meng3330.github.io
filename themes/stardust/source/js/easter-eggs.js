/* ============================================
   Easter Eggs — Konami Code 流星雨
   ============================================ */

(function() {
  'use strict';

  /* Konami code: ↑ ↑ ↓ ↓ ← → ← → B A */
  var konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
  var konamiIndex = 0;

  document.addEventListener('keydown', function(e) {
    if (e.keyCode === konamiCode[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiCode.length) {
        konamiIndex = 0;
        activateMeteorShower();
      }
    } else {
      konamiIndex = 0;
      /* Restart if the wrong key could be the start of a new sequence */
      if (e.keyCode === konamiCode[0]) konamiIndex = 1;
    }
  });

  function activateMeteorShower() {
    /* Trigger the meteor shower on the starfield canvas */
    if (typeof window.triggerMeteorShower === 'function') {
      window.triggerMeteorShower(5000);
    }

    /* Show a toast */
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = '⭐ 一场流星雨为你而来! ⭐';
    document.body.appendChild(toast);
    setTimeout(function() {
      toast.classList.add('hiding');
      setTimeout(function() { toast.remove(); }, 300);
    }, 3000);
  }

  /* Like button star animation */
  var likeBtn = document.getElementById('btn-like');
  if (likeBtn) {
    likeBtn.addEventListener('click', function() {
      this.classList.toggle('liked');
      if (this.classList.contains('liked')) {
        spawnStars(this);
      }
    });
  }

  function spawnStars(btn) {
    var rect = btn.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;

    for (var i = 0; i < 8; i++) {
      var star = document.createElement('span');
      star.textContent = '⭐';
      star.style.cssText = [
        'position: fixed',
        'left: ' + cx + 'px',
        'top: ' + cy + 'px',
        'font-size: 12px',
        'pointer-events: none',
        'z-index: 999',
        'transition: all 600ms cubic-bezier(0.4, 0, 0.2, 1)',
        'opacity: 1'
      ].join(';');
      document.body.appendChild(star);

      var angle = (Math.PI * 2 * i) / 8;
      var dist = 40 + Math.random() * 40;

      requestAnimationFrame(function() {
        star.style.transform = 'translate(' + Math.cos(angle) * dist + 'px, ' + Math.sin(angle) * dist + 'px) scale(0)';
        star.style.opacity = '0';
      });

      setTimeout(function() { star.remove(); }, 700);
    }
  }
})();
