function initScrollUI() {
  const progress = query('.scroll-progress');
  const backToTop = query('.back-to-top');
  if ((!progress && !backToTop) || document.documentElement.dataset.scrollUiInitialized === 'true') return;
  document.documentElement.dataset.scrollUiInitialized = 'true';

  let framePending = false;
  const update = () => {
    framePending = false;
    const root = document.documentElement;
    const scrollable = Math.max(root.scrollHeight - root.clientHeight, 1);
    const ratio = clamp(root.scrollTop / scrollable, 0, 1);
    if (progress) progress.style.transform = `scaleX(${ratio})`;
    if (backToTop) backToTop.classList.toggle('show', root.scrollTop > 420);
  };
  const scheduleUpdate = () => {
    if (framePending) return;
    framePending = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate, { passive: true });
  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  });
  update();
}
