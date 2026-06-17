function initFlowBackground() {
  const canvas = query('#flow-bg');
  if (!canvas || canvas.dataset.initialized === 'true') return;
  canvas.dataset.initialized = 'true';
  if (isLowPowerDevice(3) || prefersReducedMotion()) return;

  const context = canvas.getContext('2d');
  if (!context) return;
  const frameInterval = 1000 / 30;
  let width = 0;
  let height = 0;
  let time = 0;
  let animationFrame = 0;
  let lastFrame = 0;

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

  const drawStreamline = (originY, phase, alpha) => {
    context.beginPath();
    for (let x = -40; x <= width + 40; x += 16) {
      const y = originY
        + Math.sin(x * 0.009 + phase + time * 0.010) * 18
        + Math.sin(x * 0.018 - phase + time * 0.007) * 8;
      if (x === -40) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    const darkTheme = document.documentElement.dataset.theme === 'dark';
    context.strokeStyle = darkTheme
      ? `rgba(107, 182, 255, ${alpha + 0.04})`
      : `rgba(28, 80, 132, ${alpha})`;
    context.lineWidth = 1.35;
    context.stroke();
  };

  function draw(now) {
    animationFrame = 0;
    if (document.hidden) return;
    if (now - lastFrame >= frameInterval) {
      context.clearRect(0, 0, width, height);
      for (let index = 0; index < 16; index += 1) {
        drawStreamline((height / 17) * (index + 1), index * 0.72, 0.075 + (index % 4) * 0.012);
      }
      time += 1;
      lastFrame = now;
    }
    animationFrame = requestAnimationFrame(draw);
  }

  const start = () => {
    if (!animationFrame && !document.hidden) animationFrame = requestAnimationFrame(draw);
  };

  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    } else {
      start();
    }
  });
  resize();
  if ('requestIdleCallback' in window) window.requestIdleCallback(start, { timeout: 1000 });
  else window.setTimeout(start, 180);
}
