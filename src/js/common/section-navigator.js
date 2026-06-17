function initSectionNavigator() {
  const navigatorElement = query('.section-navigator');
  if (!navigatorElement || navigatorElement.dataset.initialized === 'true') return;
  navigatorElement.dataset.initialized = 'true';

  const links = queryAll('[data-section-link]', navigatorElement);
  const sections = links
    .map((link) => document.getElementById(link.dataset.sectionLink))
    .filter(Boolean);
  if (!sections.length || !('IntersectionObserver' in window)) return;

  const setActive = (id) => {
    links.forEach((link) => {
      const active = link.dataset.sectionLink === id;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];
    if (visible) setActive(visible.target.id);
  }, { rootMargin: '-24% 0px -58% 0px', threshold: [0.08, 0.16, 0.28, 0.42] });

  sections.forEach((section) => observer.observe(section));
}
