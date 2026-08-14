/* ============================================
   Table of Contents — scroll spy
   ============================================ */

(function() {
  'use strict';

  var tocLinks = document.querySelectorAll('.toc-widget a[href^="#"]');
  if (!tocLinks.length) return;

  var headings = [];
  tocLinks.forEach(function(link) {
    var id = link.getAttribute('href').replace('#', '');
    var heading = document.getElementById(id);
    if (heading) headings.push({ el: heading, link: link });
  });

  if (!headings.length) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        tocLinks.forEach(function(link) { link.classList.remove('active'); });
        var match = headings.find(function(h) { return h.el === entry.target; });
        if (match) match.link.classList.add('active');
      }
    });
  }, {
    rootMargin: '-80px 0px -80% 0px',
    threshold: 0
  });

  headings.forEach(function(h) { observer.observe(h.el); });
})();
