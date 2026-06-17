// Non-critical visitor statistics are requested only when the footer approaches the viewport.
(() => {
  'use strict';

  const STATISTICS_SELECTOR = '#site-statistics';
  const MAP_FRAME_SELECTOR = '[data-mapmyvisitors-frame]';
  const LOAD_MARGIN = '700px 0px';
  const LOAD_TIMEOUT_MS = 15_000;

  function runOnceWhenNear(element, callback) {
    let hasRun = false;
    const run = () => {
      if (hasRun) return;
      hasRun = true;
      callback();
    };

    if (!('IntersectionObserver' in window)) {
      window.addEventListener('load', () => window.setTimeout(run, 1200), { once: true });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      run();
    }, { rootMargin: LOAD_MARGIN, threshold: 0.01 });
    observer.observe(element);
  }

  function loadExternalScript(src, { id, parent = document.head } = {}) {
    return new Promise((resolve, reject) => {
      if (!src) {
        reject(new Error('Missing script URL'));
        return;
      }
      const existing = id ? document.getElementById(id) : null;
      if (existing) {
        resolve(existing);
        return;
      }

      const script = document.createElement('script');
      if (id) script.id = id;
      script.src = src;
      script.async = true;
      script.addEventListener('load', () => resolve(script), { once: true });
      script.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
      parent.appendChild(script);
    });
  }

  function loadBusuanzi(section) {
    const src = section.dataset.busuanziSrc;
    if (!src) return;
    loadExternalScript(src, { id: 'busuanzi-script' }).catch(() => {
      document.querySelectorAll('#busuanzi_value_site_pv, #busuanzi_value_site_uv')
        .forEach((node) => { node.textContent = '—'; });
    });
  }

  function loadVisitorMap(section) {
    const frame = section.querySelector(MAP_FRAME_SELECTOR);
    const frameSrc = frame?.dataset.mapmyvisitorsFrameSrc;
    if (!frame || !frameSrc || frame.querySelector('iframe')) return;

    const placeholder = frame.querySelector('[data-map-loading]');
    frame.dataset.loading = 'true';
    frame.setAttribute('aria-busy', 'true');
    if (placeholder) placeholder.textContent = '正在加载全球访问分布…';

    // MapMyVisitors may call document.write(). Loading a same-site wrapper document
    // preserves parser-inserted script behavior without blocking the main page.
    const iframe = document.createElement('iframe');
    iframe.className = 'mapmyvisitors-embed';
    iframe.title = '全球访问来源地图';
    iframe.loading = 'eager';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.src = frameSrc;

    const finish = () => {
      frame.dataset.loading = 'false';
      frame.removeAttribute('aria-busy');
    };
    const showFailure = () => {
      finish();
      if (placeholder) placeholder.textContent = '全球访问地图暂时无法加载，请稍后刷新。';
    };

    const timeout = window.setTimeout(showFailure, LOAD_TIMEOUT_MS);
    iframe.addEventListener('load', () => {
      window.clearTimeout(timeout);
      finish();
      placeholder?.remove();
    }, { once: true });
    iframe.addEventListener('error', () => {
      window.clearTimeout(timeout);
      showFailure();
    }, { once: true });
    frame.appendChild(iframe);
  }

  function initStatistics() {
    const section = document.querySelector(STATISTICS_SELECTOR);
    if (!section) return;
    runOnceWhenNear(section, () => {
      loadBusuanzi(section);
      loadVisitorMap(section);
    });
  }

  initStatistics();
})();
