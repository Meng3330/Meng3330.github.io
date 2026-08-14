/**
 * Fomalhaut🥝 - Custom Effects
 * Performance monitor, read progress bar, cursor effects, sakura petals
 */
(function () {
  'use strict';

  // =============================================
  // Page Load Progress Bar
  // =============================================
  function initProgressBar() {
    const bar = document.createElement('div');
    bar.id = 'load-progress';
    document.body.appendChild(bar);

    let progress = 0;
    const steps = [
      { pct: 15, ms: 100 },
      { pct: 40, ms: 300 },
      { pct: 65, ms: 500 },
      { pct: 80, ms: 800 },
      { pct: 95, ms: 1200 },
    ];

    function advance(i) {
      if (i >= steps.length) {
        bar.style.width = '95%';
        return;
      }
      setTimeout(() => {
        bar.style.width = steps[i].pct + '%';
        advance(i + 1);
      }, steps[i].ms);
    }

    advance(0);

    window.addEventListener('load', () => {
      bar.style.width = '100%';
      setTimeout(() => {
        bar.style.opacity = '0';
        setTimeout(() => bar.remove(), 400);
      }, 300);
    });

    // Pjax support
    document.addEventListener('pjax:send', () => {
      bar.style.width = '0%';
      bar.style.opacity = '1';
      advance(0);
    });

    document.addEventListener('pjax:complete', () => {
      bar.style.width = '100%';
      setTimeout(() => {
        bar.style.opacity = '0';
      }, 300);
    });
  }

  // =============================================
  // Performance Monitor (FPS, Memory)
  // =============================================
  function initPerfPanel() {
    const panel = document.createElement('div');
    panel.id = 'perf-panel';
    document.body.appendChild(panel);

    let lastTime = performance.now();
    let frames = 0;
    let fps = 60;
    let lastFpsUpdate = lastTime;

    function formatBytes(bytes) {
      if (!bytes) return 'N/A';
      if (bytes < 1024) return bytes + 'B';
      if (bytes < 1048576) return (bytes / 1024).toFixed(1) + 'KB';
      return (bytes / 1048576).toFixed(1) + 'MB';
    }

    function getMemory() {
      if (performance.memory) {
        const used = performance.memory.usedJSHeapSize;
        const total = performance.memory.totalJSHeapSize;
        return formatBytes(used) + ' / ' + formatBytes(total);
      }
      return 'N/A';
    }

    function update() {
      frames++;
      const now = performance.now();

      if (now - lastFpsUpdate >= 1000) {
        fps = Math.round((frames * 1000) / (now - lastFpsUpdate));
        frames = 0;
        lastFpsUpdate = now;

        const mem = getMemory();
        const conn = navigator.connection;
        let netInfo = '';
        if (conn) {
          netInfo = conn.effectiveType || conn.type || '';
          if (conn.downlink) netInfo += ' ' + conn.downlink.toFixed(1) + 'Mbps';
        }

        panel.innerHTML =
          '<span>FPS:</span> ' + fps +
          ' | <span>MEM:</span> ' + mem +
          (netInfo ? ' | <span>NET:</span> ' + netInfo : '');
      }

      requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  // =============================================
  // Sakura/Cherry Blossom Petals (CSS-based)
  // =============================================
  function initSakuraPetals() {
    const petalCount = 18;
    const colors = [
      'rgba(255, 183, 197, 0.8)',
      'rgba(255, 200, 210, 0.7)',
      'rgba(255, 220, 230, 0.75)',
      'rgba(255, 190, 205, 0.7)',
    ];

    for (let i = 0; i < petalCount; i++) {
      const petal = document.createElement('div');
      petal.className = 'sakura-petal';

      const size = Math.random() * 10 + 6;
      const left = Math.random() * 100;
      const duration = Math.random() * 10 + 10;
      const delay = Math.random() * 15;

      petal.style.cssText = `
        left: ${left}%;
        width: ${size}px;
        height: ${size}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 50% 0 50% 0;
        animation-duration: ${duration}s;
        animation-delay: ${delay}s;
      `;

      document.body.appendChild(petal);
    }
  }

  // =============================================
  // Custom Mouse Trail Effect
  // =============================================
  function initMouseTrail() {
    const dots = [];
    const maxDots = 8;
    const colors = ['#64b5f6', '#4dd0e1', '#80cbc4', '#90caf9', '#b0bec5'];

    for (let i = 0; i < maxDots; i++) {
      const dot = document.createElement('div');
      dot.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 100000;
        width: ${6 - i * 0.5}px;
        height: ${6 - i * 0.5}px;
        border-radius: 50%;
        background: ${colors[i % colors.length]};
        opacity: ${0.6 - i * 0.06};
        transition: transform 0.15s ease;
        transform: translate(-50%, -50%);
      `;
      document.body.appendChild(dot);
      dots.push({ el: dot, x: -100, y: -100 });
    }

    let mouseX = -100, mouseY = -100;
    let isMoving = false;
    let moveTimeout;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      dots[0].el.style.opacity = '0.6';
      dots[0].el.style.left = mouseX + 'px';
      dots[0].el.style.top = mouseY + 'px';

      if (!isMoving) {
        isMoving = true;
        dots.forEach(d => { d.el.style.opacity = d.el.style.opacity || '0.5'; });
      }

      clearTimeout(moveTimeout);
      moveTimeout = setTimeout(() => {
        isMoving = false;
        dots.forEach(d => { d.el.style.opacity = '0'; });
      }, 500);
    });

    function trailLoop() {
      for (let i = dots.length - 1; i > 0; i--) {
        const prev = dots[i - 1];
        dots[i].x += (prev.x - dots[i].x) * 0.45;
        dots[i].y += (prev.y - dots[i].y) * 0.45;
        dots[i].el.style.left = dots[i].x + 'px';
        dots[i].el.style.top = dots[i].y + 'px';
      }
      dots[0].x = mouseX;
      dots[0].y = mouseY;
      requestAnimationFrame(trailLoop);
    }

    requestAnimationFrame(trailLoop);
  }

  // =============================================
  // Card Tilt Effect on Hover
  // =============================================
  function initCardTilt() {
    document.addEventListener('mousemove', (e) => {
      const cards = document.querySelectorAll('#recent-posts > .recent-post-item:hover, .card-widget:hover');
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -4;
        const rotateY = ((x - centerX) / centerX) * 4;

        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });
    });

    document.addEventListener('mouseleave', () => {
      document.querySelectorAll('#recent-posts > .recent-post-item, .card-widget').forEach(card => {
        card.style.transform = '';
      });
    }, true);
  }

  // =============================================
  // Live2D-style Waving Character (simplified)
  // =============================================
  function addCornerCharacter() {
    // Create a small decorative character image in the corner
    // This is a placeholder - users can replace with their own Live2D/character
    const char = document.createElement('div');
    char.id = 'corner-character';
    char.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 99996;
      pointer-events: none;
      opacity: 0.7;
      transition: opacity 0.5s ease;
    `;
    char.innerHTML = '<div style="font-size: 48px; animation: float 3s ease-in-out infinite;">❄️</div>';
    document.body.appendChild(char);
  }

  // =============================================
  // Page Visibility - Pause snow when hidden
  // =============================================
  function initVisibilityHandler() {
    let wasHidden = false;
    document.addEventListener('visibilitychange', () => {
      const canvas = document.getElementById('snow-canvas');
      if (!canvas) return;
      if (document.hidden) {
        canvas.style.display = 'none';
        wasHidden = true;
      } else if (wasHidden) {
        canvas.style.display = '';
        wasHidden = false;
      }
    });
  }

  // =============================================
  // Initialization
  // =============================================
  function initAll() {
    initProgressBar();
    initPerfPanel();
    initSakuraPetals();
    initMouseTrail();
    initCardTilt();
    addCornerCharacter();
    initVisibilityHandler();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Re-init after Pjax navigation
  document.addEventListener('pjax:complete', () => {
    initSakuraPetals();
    initCardTilt();
  });
})();
