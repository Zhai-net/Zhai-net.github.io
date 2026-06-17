function initPublicationControls() {
  const input = query('[data-publication-search]');
  if (!input || input.dataset.initialized === 'true') return;

  const cards = queryAll('[data-pub-card]');
  const groups = queryAll('[data-year-group]');
  if (!cards.length) return;
  input.dataset.initialized = 'true';

  const count = query('[data-publication-count]');
  const empty = query('[data-publication-empty]');
  const yearLinks = queryAll('[data-year-jump]');

  const update = () => {
    const searchTerm = normalizeSearchText(input.value);
    let visibleCount = 0;

    cards.forEach((card) => {
      const haystack = normalizeSearchText(card.dataset.search || card.textContent);
      const visible = !searchTerm || haystack.includes(searchTerm);
      card.hidden = !visible;
      if (!visible) return;
      visibleCount += 1;
      const indexNode = query('.year', card);
      if (indexNode) indexNode.textContent = pad2(visibleCount);
    });

    groups.forEach((group) => {
      group.hidden = !queryAll('[data-pub-card]', group).some((card) => !card.hidden);
    });
    if (count) count.textContent = String(visibleCount);
    if (empty) empty.hidden = visibleCount !== 0;
  };

  input.addEventListener('input', update);
  update();

  const yearSections = yearLinks
    .map((link) => document.getElementById(`y${link.dataset.year}`))
    .filter(Boolean);
  if (!yearSections.length || !('IntersectionObserver' in window)) return;

  const setActiveYear = (id) => {
    yearLinks.forEach((link) => {
      const active = `y${link.dataset.year}` === id;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];
    if (visible) setActiveYear(visible.target.id);
  }, { rootMargin: '-16% 0px -68% 0px', threshold: [0.05, 0.12, 0.25] });
  yearSections.forEach((section) => observer.observe(section));
}
