function initMobileNavigation() {
  const toggle = query('.nav-toggle');
  const menu = query('#siteMenu');
  if (!toggle || !menu || toggle.dataset.initialized === 'true') return;
  toggle.dataset.initialized = 'true';

  const setOpen = (open) => {
    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
    document.body.classList.toggle('menu-open', open);
  };

  toggle.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('click', (event) => {
    if (!menu.classList.contains('open')) return;
    if (!menu.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
  });
  window.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !menu.classList.contains('open')) return;
    setOpen(false);
    toggle.focus();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > BREAKPOINTS.mobileNavigation) setOpen(false);
  }, { passive: true });
}
