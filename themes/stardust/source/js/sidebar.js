/* ============================================
   Sidebar — 折叠/展开
   ============================================ */

(function() {
  'use strict';

  var sidebar = document.getElementById('stardust-sidebar');
  if (!sidebar) return;

  var toggleBtn = document.getElementById('sidebar-toggle');
  var closeBtn = document.getElementById('sidebar-close-btn');
  var overlay = document.getElementById('sidebar-overlay');

  function open() {
    sidebar.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    sidebar.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (toggleBtn) toggleBtn.addEventListener('click', open);
  if (closeBtn)  closeBtn.addEventListener('click', close);
  if (overlay)   overlay.addEventListener('click', close);

  /* Close on Escape */
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) {
      close();
    }
  });

  /* Close on outside click */
  document.addEventListener('click', function(e) {
    if (sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        e.target !== toggleBtn) {
      close();
    }
  });
})();
