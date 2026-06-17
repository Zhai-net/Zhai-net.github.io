// Load non-critical visitor statistics only when the footer approaches the viewport.
(() => {
  'use strict';

  const section = document.querySelector('#site-statistics');
  if (!section) return;

  const runWhenNear = (callback) => {
    let ran = false;
    const run = () => {
      if (ran) return;
      ran = true;
      callback();
    };

    if (!('IntersectionObserver' in window)) {
      window.addEventListener('load', () => window.setTimeout(run, 1200), { once: true });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        run();
      }
    }, { rootMargin: '700px 0px', threshold: 0.01 });
    observer.observe(section);
  };

  const loadScript = (src, { id, parent = document.head } = {}) => new Promise((resolve, reject) => {
    if (!src) {
      reject(new Error('Missing script URL'));
      return;
    }
    if (id && document.getElementById(id)) {
      resolve(document.getElementById(id));
      return;
    }
    const script = document.createElement('script');
    if (id) script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    parent.appendChild(script);
  });

  const loadBusuanzi = () => {
    const src = section.dataset.busuanziSrc;
    if (!src) return;
    loadScript(src, { id: 'busuanzi-script' }).catch(() => {
      document.querySelectorAll('#busuanzi_value_site_pv, #busuanzi_value_site_uv')
        .forEach((node) => { node.textContent = '—'; });
    });
  };

  const loadMapMyVisitors = () => {
    const frame = section.querySelector('[data-mapmyvisitors-frame]');
    const frameSrc = frame ? frame.dataset.mapmyvisitorsFrameSrc : '';
    if (!frame || !frameSrc || frame.querySelector('iframe')) return;

    frame.dataset.loading = 'true';
    const placeholder = frame.querySelector('[data-map-loading]');
    if (placeholder) placeholder.textContent = '正在加载全球访问分布…';

    // Create the iframe only when the statistics section approaches the viewport.
    // The iframe loads a normal same-site HTML wrapper containing a parser-inserted
    // MapMyVisitors script. This preserves document.write() compatibility and avoids
    // the restricted about:srcdoc environment that can leave the map blank.
    const iframe = document.createElement('iframe');
    iframe.className = 'mapmyvisitors-embed';
    iframe.title = '全球访问来源地图';
    iframe.loading = 'eager';
    iframe.src = frameSrc;

    const showFailure = () => {
      frame.dataset.loading = 'false';
      if (placeholder) {
        placeholder.textContent = '全球访问地图暂时无法加载，请稍后刷新。';
      }
    };

    const timeout = window.setTimeout(showFailure, 15000);
    iframe.addEventListener('load', () => {
      window.clearTimeout(timeout);
      frame.dataset.loading = 'false';
      if (placeholder) placeholder.remove();
    }, { once: true });
    iframe.addEventListener('error', () => {
      window.clearTimeout(timeout);
      showFailure();
    }, { once: true });

    frame.appendChild(iframe);
  };


  runWhenNear(() => {
    loadBusuanzi();
    loadMapMyVisitors();
  });
})();
