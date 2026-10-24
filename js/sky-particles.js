/* 天空蓝主题 · 漂浮光点 / 星星粒子
   原生 Canvas 实现，无外部依赖，尊重系统“减少动态效果”设置 */
(function () {
  'use strict';

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  var canvas = document.createElement('canvas');
  canvas.id = 'sky-particles';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);

  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var width = 0;
  var height = 0;
  var dpr = 1;
  var particles = [];
  var frameId = null;
  var tick = 0;

  function particleCount() {
    return Math.max(18, Math.min(64, Math.floor(window.innerWidth / 28)));
  }

  function createParticle() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.1 + 0.6,
      vx: (Math.random() - 0.5) * 0.18,
      vy: -(Math.random() * 0.28 + 0.06),
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.004,
      alpha: Math.random() * 0.45 + 0.18,
      star: Math.random() < 0.16
    };
  }

  function build() {
    particles = [];
    var total = particleCount();
    for (var i = 0; i < total; i++) {
      particles.push(createParticle());
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  function drawStar(x, y, radius, alpha) {
    var spikes = 4;
    var inner = radius * 0.38;
    ctx.beginPath();
    for (var i = 0; i < spikes * 2; i++) {
      var r = i % 2 === 0 ? radius : inner;
      var angle = (Math.PI / spikes) * i - Math.PI / 2;
      var px = x + Math.cos(angle) * r;
      var py = y + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, ' + alpha + ')';
    ctx.fill();
  }

  function render() {
    if (document.hidden) {
      frameId = requestAnimationFrame(render);
      return;
    }

    tick += 1;
    ctx.clearRect(0, 0, width, height);

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx + Math.sin(tick * p.speed + p.phase) * 0.16;
      p.y += p.vy;

      if (p.y < -12) {
        p.y = height + 12;
        p.x = Math.random() * width;
      }
      if (p.x < -12) p.x = width + 12;
      if (p.x > width + 12) p.x = -12;

      var twinkle = 0.5 + 0.5 * Math.sin(tick * p.speed * 2.2 + p.phase);
      var alpha = p.alpha * (0.35 + 0.65 * twinkle);

      if (p.star) {
        drawStar(p.x, p.y, p.radius * 2.2, alpha);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, ' + alpha + ')';
        ctx.fill();

        if (p.radius > 1.6) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 3.2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(160, 215, 255, ' + alpha * 0.18 + ')';
          ctx.fill();
        }
      }
    }

    frameId = requestAnimationFrame(render);
  }

  resize();
  frameId = requestAnimationFrame(render);

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 180);
  });

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && frameId === null) {
      frameId = requestAnimationFrame(render);
    }
  });
})();
