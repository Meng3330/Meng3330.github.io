/* ============================================
   Dark Mode — 自动切换 + 手动切换
   ============================================ */

(function() {
  'use strict';

  var toggleBtn = document.getElementById('theme-toggle');
  var darkStart = 19;
  var darkEnd = 7;

  function getAutoTheme() {
    var hour = new Date().getHours();
    return (hour >= darkStart || hour < darkEnd) ? 'dark' : 'light';
  }

  function setTheme(theme, store) {
    if (theme === 'auto') {
      theme = getAutoTheme();
    }
    document.documentElement.setAttribute('data-theme', theme);
    if (store !== false) {
      try { localStorage.setItem('stardust-theme', theme); } catch(e) {}
    }
  }

  function cycleTheme() {
    var current = document.documentElement.getAttribute('data-theme');
    var next;
    if (current === 'light') next = 'dark';
    else if (current === 'dark') next = 'auto';
    else next = 'light';

    if (next === 'auto') {
      setTheme(getAutoTheme(), true);
      try { localStorage.setItem('stardust-theme', 'auto'); } catch(e) {}
    } else {
      setTheme(next, true);
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', cycleTheme);
  }

  /* Listen for system theme changes */
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
      var stored = null;
      try { stored = localStorage.getItem('stardust-theme'); } catch(ex) {}
      if (!stored || stored === 'auto') {
        setTheme(e.matches ? 'dark' : 'light', false);
      }
    });
  }

  /* Check time-based auto switch every minute */
  setInterval(function() {
    var stored = null;
    try { stored = localStorage.getItem('stardust-theme'); } catch(e) {}
    if (!stored || stored === 'auto') {
      setTheme(getAutoTheme(), false);
    }
  }, 60000);
})();
