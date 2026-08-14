/* ============================================
   Loading Screen — 星尘汇聚成书
   ============================================ */

(function() {
  'use strict';

  var overlay = document.getElementById('stardust-loading');
  if (!overlay) return;

  var canvas = document.getElementById('loading-canvas');
  var ctx = canvas ? canvas.getContext('2d') : null;
  var quoteEl = document.getElementById('loading-quote');
  var particles = [];
  var width, height;
  var progress = 0;
  var targetProgress = 0;
  var startTime = Date.now();
  var loadingDone = false;
  var fadeStarted = false;

  var quotes = [
    '我们都是孤独的行路人，唯有书籍能照亮前路',
    '每一本书都是一个打开的世界',
    '思想的深度，决定了人生的高度',
    '在阅读中，我们遇见更好的自己',
    '书籍是横渡时间大海的航船'
  ];

  if (quoteEl) {
    quoteEl.textContent = quotes[Math.floor(Math.random() * quotes.length)];
  }

  function Particle() {
    this.reset();
  }

  Particle.prototype.reset = function() {
    var angle = Math.random() * Math.PI * 2;
    var radius = 30 + Math.random() * 150;
    this.targetX = width / 2 + Math.cos(angle) * (radius * (1 - progress));
    this.targetY = height / 2 + Math.sin(angle) * (radius * (1 - progress));
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.size = 0.5 + Math.random() * 2;
    this.speed = 0.01 + Math.random() * 0.03;
    this.opacity = 0.3 + Math.random() * 0.7;
    this.hue = 200 + Math.random() * 60;
  };

  Particle.prototype.update = function() {
    this.x += (this.targetX - this.x) * this.speed;
    this.y += (this.targetY - this.y) * this.speed;
  };

  Particle.prototype.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = 'hsla(' + this.hue + ', 60%, 75%, ' + this.opacity + ')';
    ctx.fill();
  };

  function resize() {
    if (!canvas) return;
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function animateParticles() {
    if (!ctx || loadingDone) return;
    ctx.clearRect(0, 0, width, height);

    targetProgress = Math.min(1, (Date.now() - startTime) / 3000);

    for (var i = 0; i < particles.length; i++) {
      var angle = Math.random() * Math.PI * 2;
      var radius = 30 + Math.random() * 150;
      particles[i].targetX = width / 2 + Math.cos(angle) * (radius * (1 - targetProgress * 0.9));
      particles[i].targetY = height / 2 + Math.sin(angle) * (radius * (1 - targetProgress * 0.9));
      particles[i].update();
      particles[i].draw();
    }

    var bookAlpha = Math.max(0, targetProgress - 0.3) / 0.7;
    var bookEl = document.getElementById('loading-book');
    if (bookEl) bookEl.style.opacity = bookAlpha;

    requestAnimationFrame(animateParticles);
  }

  function fadeOutLoading() {
    if (fadeStarted) return;
    fadeStarted = true;
    loadingDone = true;

    overlay.style.transition = 'opacity 500ms cubic-bezier(0.4, 0, 0.2, 1)';
    overlay.style.opacity = '0';

    setTimeout(function() {
      overlay.style.display = 'none';
      document.body.classList.add('loaded');

      /* Stagger entrance animation for content */
      var elements = document.querySelectorAll('.home-content > section, .post-container, .page-content');
      elements.forEach(function(el, i) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 500ms cubic-bezier(0.4, 0, 0.2, 1) ' + (i * 100) + 'ms, transform 500ms cubic-bezier(0.4, 0, 0.2, 1) ' + (i * 100) + 'ms';
        requestAnimationFrame(function() {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        });
      });
    }, 500);
  }

  function init() {
    resize();
    if (ctx) {
      for (var i = 0; i < 60; i++) {
        particles.push(new Particle());
      }
      animateParticles();
    }

    /* Timeout fallback */
    var timeout = setTimeout(function() {
      fadeOutLoading();
    }, 5000);

    /* Fade out when page loads */
    window.addEventListener('load', function() {
      clearTimeout(timeout);
      var elapsed = Date.now() - startTime;
      var minDelay = Math.max(0, 1200 - elapsed);
      setTimeout(fadeOutLoading, minDelay);
    });
  }

  window.addEventListener('resize', resize);
  init();
})();
