/* ============================================
   Starfield Canvas — 动态星空背景
   ============================================ */

(function() {
  'use strict';

  var canvas = document.getElementById('starfield-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var stars = [];
  var meteors = [];
  var mouseX = 0, mouseY = 0;
  var targetMouseX = 0, targetMouseY = 0;
  var width, height;
  var animationId;

  var config = {
    starCount: 120,
    starMinSize: 0.5,
    starMaxSize: 2.5,
    baseSpeed: 0.3,
    connectDist: 120,
    twinkleSpeed: 0.005,
    meteorInterval: 8000,
    meteorChance: 0.003
  };

  function Star() {
    this.reset(true);
  }

  Star.prototype.reset = function(randomY) {
    this.x = Math.random() * width;
    this.y = randomY ? Math.random() * height : (Math.random() < 0.3 ? Math.random() * height : -10);
    this.size = config.starMinSize + Math.random() * (config.starMaxSize - config.starMinSize);
    this.baseOpacity = 0.3 + Math.random() * 0.7;
    this.opacity = this.baseOpacity;
    this.twinklePhase = Math.random() * Math.PI * 2;
    this.twinkleSpeed = config.twinkleSpeed * (0.5 + Math.random());
    this.driftX = (Math.random() - 0.5) * 0.2;
    this.driftY = config.baseSpeed * (0.3 + Math.random() * 0.7);
    this.parallax = this.size / config.starMaxSize;
    this.hue = 200 + Math.random() * 60;
  };

  Star.prototype.update = function() {
    this.twinklePhase += this.twinkleSpeed;
    this.opacity = this.baseOpacity + Math.sin(this.twinklePhase) * 0.3;
    this.opacity = Math.max(0.1, Math.min(1, this.opacity));

    this.y += this.driftY;
    this.x += this.driftX;
    this.x += (targetMouseX - mouseX) * this.parallax * 0.01;
    this.y += (targetMouseY - mouseY) * this.parallax * 0.01;

    if (this.y > height + 10) { this.y = -10; this.x = Math.random() * width; }
    if (this.y < -10) { this.y = height + 10; this.x = Math.random() * width; }
    if (this.x > width + 10) this.x = -10;
    if (this.x < -10) this.x = width + 10;
  };

  Star.prototype.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = 'hsla(' + this.hue + ', 60%, 80%, ' + this.opacity + ')';
    ctx.fill();

    if (this.size > 1.8 && this.opacity > 0.7) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = 'hsla(' + this.hue + ', 60%, 70%, ' + (this.opacity * 0.15) + ')';
      ctx.fill();
    }
  };

  function Meteor() {
    this.reset();
  }

  Meteor.prototype.reset = function() {
    this.x = Math.random() * width * 1.5;
    this.y = Math.random() * height * 0.5;
    this.length = 60 + Math.random() * 120;
    this.speed = 4 + Math.random() * 8;
    this.size = 1 + Math.random() * 2;
    this.opacity = 0.6 + Math.random() * 0.4;
    this.active = true;
    this.hue = 210 + Math.random() * 30;
  };

  Meteor.prototype.update = function() {
    this.x -= this.speed;
    this.y += this.speed * 0.7;
    this.opacity -= 0.008;
    if (this.opacity <= 0 || this.y > height + 100) {
      this.active = false;
    }
  };

  Meteor.prototype.draw = function() {
    var gradient = ctx.createLinearGradient(
      this.x, this.y,
      this.x + this.length, this.y - this.length * 0.7
    );
    gradient.addColorStop(0, 'hsla(' + this.hue + ', 80%, 90%, ' + this.opacity + ')');
    gradient.addColorStop(1, 'hsla(' + this.hue + ', 80%, 90%, 0)');

    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.length, this.y - this.length * 0.7);
    ctx.lineWidth = this.size;
    ctx.strokeStyle = gradient;
    ctx.stroke();
  };

  function drawConnections() {
    for (var i = 0; i < stars.length; i++) {
      for (var j = i + 1; j < stars.length; j++) {
        var dx = stars[i].x - stars[j].x;
        var dy = stars[i].y - stars[j].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < config.connectDist) {
          var alpha = (1 - dist / config.connectDist) * 0.12;
          ctx.beginPath();
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          ctx.strokeStyle = 'rgba(147,197,253,' + alpha + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }

  function spawnMeteor() {
    if (meteors.length < 2) {
      meteors.push(new Meteor());
    }
  }

  var lastMeteorTime = 0;
  var meteorShowerActive = false;
  var meteorShowerTimer = null;

  function animate(timestamp) {
    ctx.clearRect(0, 0, width, height);

    for (var i = 0; i < stars.length; i++) {
      stars[i].update();
      stars[i].draw();
    }

    drawConnections();

    if (!meteorShowerActive && Math.random() < config.meteorChance && timestamp - lastMeteorTime > config.meteorInterval) {
      spawnMeteor();
      lastMeteorTime = timestamp;
    }

    for (var j = meteors.length - 1; j >= 0; j--) {
      meteors[j].update();
      meteors[j].draw();
      if (!meteors[j].active) meteors.splice(j, 1);
    }

    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;
    animationId = requestAnimationFrame(animate);
  }

  function init() {
    resize();
    stars = [];
    for (var i = 0; i < config.starCount; i++) {
      stars.push(new Star());
    }
  }

  document.addEventListener('mousemove', function(e) {
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
  });

  document.addEventListener('touchmove', function(e) {
    if (e.touches.length) {
      targetMouseX = e.touches[0].clientX;
      targetMouseY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('resize', function() {
    resize();
    stars.forEach(function(s) { s.reset(true); });
  });

  /* Expose meteor shower trigger (for easter eggs) */
  window.triggerMeteorShower = function(duration) {
    meteorShowerActive = true;
    var count = 0;
    var max = 30;
    var interval = setInterval(function() {
      meteors.push(new Meteor());
      count++;
      if (count >= max) {
        clearInterval(interval);
        setTimeout(function() { meteorShowerActive = false; }, duration || 3000);
      }
    }, 80);
  };

  init();
  animationId = requestAnimationFrame(animate);
})();
