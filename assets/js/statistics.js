/** Defer non-critical visitor statistics until the footer approaches the viewport. */
(() => {
  "use strict";

  const { query, queryAll } = window.ZHAI_UTILS;
  const section = query("#site-statistics");
  if (!section) return;

  const runWhenNear = (callback) => {
    let hasRun = false;
    const run = () => {
      if (hasRun) return;
      hasRun = true;
      callback();
    };

    if (!("IntersectionObserver" in window)) {
      window.addEventListener("load", () => window.setTimeout(run, 1200), {
        once: true,
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        run();
      },
      { rootMargin: "700px 0px", threshold: 0.01 },
    );
    observer.observe(section);
  };

  const loadScript = (source, { id, parent = document.head } = {}) =>
    new Promise((resolve, reject) => {
      if (!source) {
        reject(new Error("Missing script URL"));
        return;
      }

      const existing = id ? document.getElementById(id) : null;
      if (existing) {
        resolve(existing);
        return;
      }

      const script = document.createElement("script");
      if (id) script.id = id;
      script.src = source;
      script.async = true;
      script.onload = () => resolve(script);
      script.onerror = () => reject(new Error(`Failed to load ${source}`));
      parent.appendChild(script);
    });

  const loadBusuanzi = () => {
    const source = section.dataset.busuanziSrc;
    if (!source) return;

    loadScript(source, { id: "busuanzi-script" }).catch(() => {
      queryAll("#busuanzi_value_site_pv, #busuanzi_value_site_uv").forEach(
        (node) => {
          node.textContent = "—";
        },
      );
    });
  };

  const loadVisitorMap = () => {
    const frame = query("[data-mapmyvisitors-frame]", section);
    const source = frame?.dataset.mapmyvisitorsFrameSrc;
    if (!frame || !source || query("iframe", frame)) return;

    frame.dataset.loading = "true";
    const placeholder = query("[data-map-loading]", frame);
    if (placeholder) placeholder.textContent = "正在加载全球访问分布…";

    const iframe = document.createElement("iframe");
    iframe.className = "mapmyvisitors-embed";
    iframe.title = "全球访问来源地图";
    iframe.loading = "eager";
    iframe.src = source;

    const showFailure = () => {
      frame.dataset.loading = "false";
      if (placeholder)
        placeholder.textContent = "全球访问地图暂时无法加载，请稍后刷新。";
    };

    const timeout = window.setTimeout(showFailure, 15000);
    iframe.addEventListener(
      "load",
      () => {
        window.clearTimeout(timeout);
        frame.dataset.loading = "false";
        placeholder?.remove();
      },
      { once: true },
    );
    iframe.addEventListener(
      "error",
      () => {
        window.clearTimeout(timeout);
        showFailure();
      },
      { once: true },
    );
    frame.appendChild(iframe);
  };

  runWhenNear(() => {
    loadBusuanzi();
    loadVisitorMap();
  });
})();
