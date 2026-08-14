/* ============================================
   Floating Action Buttons
   ============================================ */

(function() {
  'use strict';

  var scrollBtn = document.getElementById('btn-scroll-top');
  var tocBtn = document.getElementById('btn-toc-float');
  var shareBtn = document.getElementById('btn-share-float');
  var commentBtn = document.getElementById('btn-comment-float');
  var progressCircle = document.getElementById('progress-circle');

  if (progressCircle) {
    var circumference = 2 * Math.PI * 20;
    progressCircle.style.strokeDasharray = circumference;
    progressCircle.style.strokeDashoffset = circumference;
  }

  var ticking = false;

  function updateScrollProgress() {
    if (!ticking) {
      requestAnimationFrame(function() {
        var scrollY = window.scrollY;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var progress = docHeight > 0 ? scrollY / docHeight : 0;

        if (scrollBtn) {
          scrollBtn.style.display = scrollY > 300 ? 'flex' : 'none';
        }

        if (progressCircle) {
          var offset = circumference - progress * circumference;
          progressCircle.style.strokeDashoffset = offset;
        }
        ticking = false;
      });
      ticking = true;
    }
  }

  if (scrollBtn) {
    scrollBtn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (tocBtn) {
    tocBtn.addEventListener('click', function() {
      var toc = document.querySelector('.toc-widget, .post-toc-sidebar');
      if (toc) {
        toc.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', function() {
      if (navigator.share) {
        navigator.share({
          title: document.title,
          url: window.location.href
        }).catch(function() {});
      } else {
        navigator.clipboard.writeText(window.location.href).then(function() {
          var toast = document.createElement('div');
          toast.className = 'toast';
          toast.textContent = '链接已复制!';
          document.body.appendChild(toast);
          setTimeout(function() {
            toast.classList.add('hiding');
            setTimeout(function() { toast.remove(); }, 300);
          }, 2000);
        }).catch(function() {});
      }
    });
  }

  if (commentBtn) {
    commentBtn.addEventListener('click', function() {
      var comments = document.getElementById('comments');
      if (comments) {
        comments.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  window.addEventListener('scroll', updateScrollProgress, { passive: true });
})();
