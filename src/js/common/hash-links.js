function initDynamicHashLinks() {
  if (document.documentElement.dataset.hashLinksInitialized === 'true') return;
  document.documentElement.dataset.hashLinksInitialized = 'true';

  const sync = () => {
    const id = decodeURIComponent(window.location.hash.replace(/^#/, ''));
    const tabs = queryAll('.page-tabs a[href*="#"]');
    tabs.forEach((tab) => {
      const tabHash = new URL(tab.href, window.location.href).hash.replace(/^#/, '');
      const active = Boolean(id) && tabHash === id;
      tab.classList.toggle('active', active);
      if (active) tab.setAttribute('aria-current', 'location');
      else tab.removeAttribute('aria-current');
    });
    if (!id) return;
    const target = document.getElementById(id);
    if (target) requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
  };

  window.addEventListener('hashchange', sync);
  document.addEventListener('zhai:content-rendered', sync);
  sync();
}
