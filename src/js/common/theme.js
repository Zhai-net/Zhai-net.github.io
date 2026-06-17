function initThemeToggle() {
  const root = document.documentElement;
  const toggle = query('[data-theme-toggle]');
  if (!toggle || toggle.dataset.initialized === 'true') return;
  toggle.dataset.initialized = 'true';

  const icon = query('.theme-icon', toggle);
  const label = query('.theme-label', toggle);

  const applyTheme = (theme) => {
    const safeTheme = theme === 'dark' ? 'dark' : 'light';
    root.dataset.theme = safeTheme;
    root.style.colorScheme = safeTheme;
    document.body.dataset.theme = safeTheme;

    const themeColor = query('meta[name="theme-color"]');
    if (themeColor) themeColor.content = THEME_COLORS[safeTheme];
    toggle.setAttribute('aria-pressed', String(safeTheme === 'dark'));
    if (icon) icon.textContent = safeTheme === 'dark' ? '☀️' : '🌙';
    if (label) label.textContent = safeTheme === 'dark' ? '浅色' : '深色';
  };

  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  } catch (error) {
    savedTheme = null;
  }
  const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : preferredTheme);

  toggle.addEventListener('click', () => {
    const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch (error) {
      // The theme still applies for the current visit when storage is unavailable.
    }
    applyTheme(nextTheme);
  });
}
