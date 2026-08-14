/**
 * Fomalhaut🥝 - Snow Animation
 * Beautiful winter snow effect with varying particle sizes and wind
 */
(function () {
  'use strict';

  function createSnowCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = 'snow-canvas';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width, height;
    let snowflakes = [];
    const maxSnowflakes = 120;

    // Snowflake class
    class Snowflake {
      constructor() {
        this.reset(true);
      }

      reset(init) {
        this.x = Math.random() * width;
        this.y = init ? Math.random() * height : -10;
        this.radius = Math.random() * 3.5 + 1.2;
        this.speed = Math.random() * 1.5 + 0.4;
        this.wind = Math.random() * 0.6 - 0.3;
        this.opacity = Math.random() * 0.6 + 0.3;
        this.swingPhase = Math.random() * Math.PI * 2;
        this.swingSpeed = Math.random() * 0.02 + 0.005;
        this.swingAmp = Math.random() * 1.2 + 0.3;
      }

      update() {
        this.y += this.speed;
        this.swingPhase += this.swingSpeed;
        this.x += this.wind + Math.sin(this.swingPhase) * this.swingAmp * 0.3;

        if (this.y > height + 10) {
          this.y = -10;
          this.x = Math.random() * width;
        }

        if (this.x > width + 10) this.x = -10;
        if (this.x < -10) this.x = width + 10;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 235, 255, ${this.opacity})`;
        ctx.fill();

        // Subtle glow on bigger flakes
        if (this.radius > 2.5) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius * 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200, 225, 255, ${this.opacity * 0.2})`;
          ctx.fill();
        }
      }
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }

    function initSnowflakes() {
      snowflakes = [];
      for (let i = 0; i < maxSnowflakes; i++) {
        snowflakes.push(new Snowflake());
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      snowflakes.forEach(flake => {
        flake.update();
        flake.draw();
      });

      requestAnimationFrame(animate);
    }

    resize();
    initSnowflakes();
    animate();

    window.addEventListener('resize', () => {
      resize();
      initSnowflakes();
    });

    // Re-init on pjax page changes
    document.addEventListener('pjax:complete', () => {
      resize();
      initSnowflakes();
    });
  }

  // Start after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createSnowCanvas);
  } else {
    createSnowCanvas();
  }
})();
