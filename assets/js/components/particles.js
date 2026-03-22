/* ============================================
   PARTICLES — Particules flottantes (canvas)
   ============================================ */

class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.running = true;
    this.resize();
    this.init();
    this.loop();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width  = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  init() {
    const count = Math.floor((this.canvas.width * this.canvas.height) / 18000);
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle(true));
    }
  }

  createParticle(random = false) {
    const types = ['star', 'mote', 'ember'];
    const type  = types[Math.floor(Math.random() * types.length)];
    return {
      type,
      x:     random ? Math.random() * this.canvas.width  : Math.random() * this.canvas.width,
      y:     random ? Math.random() * this.canvas.height : this.canvas.height + 10,
      size:  type === 'star' ? Math.random() * 2 + 0.5
           : type === 'mote' ? Math.random() * 3 + 1
           :                   Math.random() * 1.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: -(Math.random() * 0.4 + 0.1),
      alpha:  Math.random() * 0.6 + 0.2,
      alphaSpeed: (Math.random() * 0.008 + 0.002) * (Math.random() < 0.5 ? 1 : -1),
      hue:   type === 'ember' ? Math.random() * 20 + 20   // orangé
           : type === 'mote'  ? Math.random() * 30 + 35   // or
           :                    0,                          // blanc/bleu
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.005,
    };
  }

  draw(p) {
    const ctx = this.ctx;
    p.pulse += p.pulseSpeed;
    const pulsedAlpha = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, pulsedAlpha));

    if (p.type === 'star') {
      ctx.fillStyle = `hsl(${p.hue + 200}, 40%, 90%)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'mote') {
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
      gradient.addColorStop(0, `hsla(${p.hue}, 70%, 70%, 1)`);
      gradient.addColorStop(1, `hsla(${p.hue}, 70%, 70%, 0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.shadowBlur  = 4;
      ctx.shadowColor = `hsl(${p.hue + 15}, 100%, 60%)`;
      ctx.fillStyle   = `hsl(${p.hue}, 80%, 70%)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  loop() {
    if (!this.running) return;
    const ctx  = this.ctx;
    const w    = this.canvas.width;
    const h    = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    this.particles.forEach((p, i) => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.alpha += p.alphaSpeed;

      if (p.alpha <= 0) p.alphaSpeed = Math.abs(p.alphaSpeed);
      if (p.alpha >= 0.8) p.alphaSpeed = -Math.abs(p.alphaSpeed);

      if (p.y < -10 || p.x < -10 || p.x > w + 10) {
        this.particles[i] = this.createParticle(false);
        return;
      }

      this.draw(p);
    });

    requestAnimationFrame(() => this.loop());
  }

  destroy() {
    this.running = false;
  }
}
