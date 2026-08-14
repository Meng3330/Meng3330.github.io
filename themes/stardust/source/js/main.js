/* ============================================
   Stardust Main — 全局初始化
   ============================================ */

(function() {
  'use strict';

  /* Site runtime counter */
  function updateRuntime() {
    var el = document.getElementById('site-runtime');
    if (!el) return;

    var since = new Date('2025-01-01T00:00:00');
    var now = new Date();
    var diff = now - since;
    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    el.textContent = days + ' 天 ' + hours + ' 小时 ' + minutes + ' 分';
  }

  updateRuntime();
  setInterval(updateRuntime, 60000);

  /* Hero subtitle typing effect */
  var heroSub = document.getElementById('hero-subtitle');
  if (heroSub) {
    var text = heroSub.textContent;
    heroSub.textContent = '';
    heroSub.style.borderRight = '2px solid var(--accent)';
    var i = 0;
    var typeInterval = setInterval(function() {
      if (i < text.length) {
        heroSub.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(typeInterval);
        heroSub.style.borderRight = 'none';
      }
    }, 80);
  }

  /* Smooth scroll for hero CTA */
  var heroCta = document.querySelector('.hero-cta');
  if (heroCta) {
    heroCta.addEventListener('click', function(e) {
      e.preventDefault();
      var target = document.getElementById('home-content');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
})();
