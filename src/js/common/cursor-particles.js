function initCursorParticles() {
  const canvas = query('.cursor-particles');
  if (!canvas || canvas.dataset.initialized === 'true') return;
  canvas.dataset.initialized = 'true';
  if (isLowPowerDevice(4) || prefersReducedMotion() || hasCoarsePointer()) return;

  const context = canvas.getContext('2d');
  if (!context) return;
  const hero = query('.hero, .page-hero');
  const colors = ['28,80,132', '167,45,58', '184,145,66', '40,109,114'];
  const particles = [];
  let width = 0;
  let height = 0;
  let lastCreatedAt = 0;
  let animationFrame = 0;
  let pointerInHero = hero ? hero.matches(':hover') : false;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const scheduleDraw = () => {
    if (!animationFrame && !document.hidden) animationFrame = requestAnimationFrame(draw);
  };

  const addParticle = (x, y) => {
    if (particles.length >= 42) particles.shift();
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.22 + Math.random() * 0.58;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.08,
      radius: 1 + Math.random() * 1.9,
      life: 1,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
    scheduleDraw();
  };

  function draw() {
    animationFrame = 0;
    context.clearRect(0, 0, width, height);
    for (let index = particles.length - 1; index >= 0; index -= 1) {
      const particle = particles[index];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.004;
      particle.life -= 0.014;
      if (particle.life <= 0) {
        particles.splice(index, 1);
        continue;
      }
      context.beginPath();
      context.fillStyle = `rgba(${particle.color}, ${0.20 * particle.life})`;
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();
    }
    if (particles.length) scheduleDraw();
  }

  window.addEventListener('resize', resize, { passive: true });
  hero?.addEventListener('pointerenter', () => { pointerInHero = true; }, { passive: true });
  hero?.addEventListener('pointerleave', () => { pointerInHero = false; }, { passive: true });
  window.addEventListener('mousemove', (event) => {
    if (hero && !pointerInHero) return;
    const now = performance.now();
    if (now - lastCreatedAt < 22) return;
    lastCreatedAt = now;
    addParticle(event.clientX, event.clientY);
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    } else if (particles.length) {
      scheduleDraw();
    }
  });
  resize();
}
