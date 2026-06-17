let revealObserver = null;

function prepareRevealNodes() {
  const nodes = queryAll('.reveal:not([data-reveal-prepared])');
  if (!nodes.length) return;
  nodes.forEach((node) => { node.dataset.revealPrepared = 'true'; });

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    nodes.forEach((node) => node.classList.add('in-view'));
    return;
  }

  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
  }
  nodes.forEach((node) => revealObserver.observe(node));
}
