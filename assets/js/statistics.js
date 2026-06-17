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

  const loadVisitorIpMap = () => {
    const mapCard = section.querySelector('[data-visitor-map-card]');
    const map = section.querySelector('[data-visitor-map]');
    const dot = section.querySelector('[data-visitor-map-dot]');
    const status = section.querySelector('[data-visitor-map-status]');
    const location = section.querySelector('[data-visitor-map-location]');
    const external = section.querySelector('[data-visitor-map-external]');
    const config = (window.ZHAI_SITE && window.ZHAI_SITE.visitorMap) || {};

    if (!mapCard || !map || !dot) return;
    const setStatus = (value) => { if (status) status.textContent = value; };
    const setLocation = (value) => { if (location) location.textContent = value; };

    if (config.aggregateMapUrl && external) {
      external.href = config.aggregateMapUrl;
      external.hidden = false;
    }
    if (config.enabled === false) {
      mapCard.hidden = true;
      return;
    }

    const endpoint = config.endpoint || 'https://ipwho.is/';
    const controller = 'AbortController' in window ? new AbortController() : null;
    const timeout = controller ? window.setTimeout(() => controller.abort(), 8000) : 0;

    const placeDot = (latitude, longitude) => {
      const lat = Math.max(-85, Math.min(85, Number(latitude)));
      const lon = Math.max(-180, Math.min(180, Number(longitude)));
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return false;
      dot.style.left = `${((lon + 180) / 360) * 100}%`;
      dot.style.top = `${((90 - lat) / 180) * 100}%`;
      dot.classList.add('show');
      return true;
    };

    setStatus('加载中');
    setLocation('正在获取当前访问 IP 的地理位置。');
    fetch(endpoint, { cache: 'no-store', signal: controller ? controller.signal : undefined })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('IP lookup failed')))
      .then((data) => {
        if (!data || data.success === false) throw new Error(data && data.message ? data.message : 'IP lookup failed');
        const city = data.city || data.region || '';
        const country = data.country || '';
        const ip = data.ip ? ` · ${data.ip}` : '';
        setStatus(placeDot(data.latitude, data.longitude) ? '已定位' : '已连接');
        setLocation([city, country].filter(Boolean).join('，') + ip || '已获取访问来源，但未返回可定位坐标。');
      })
      .catch(() => {
        setStatus('暂不可用');
        setLocation('本地预览、网络状况或浏览器隐私策略可能阻止 IP 定位请求。');
      })
      .finally(() => { if (timeout) window.clearTimeout(timeout); });
  };

  runWhenNear(() => {
    loadBusuanzi();
    loadMapMyVisitors();
    loadVisitorIpMap();
  });
})();
