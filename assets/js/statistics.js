/** Defer non-critical visitor statistics until the footer approaches the viewport. */
(() => {
  "use strict";

  const { query, queryAll } = window.ZHAI_UTILS;
  const language = document.documentElement.lang.toLowerCase().startsWith("en")
    ? "en"
    : "zh";
  const ui = window.ZHAI_I18N?.[language]?.ui || {};
  const isEnglish = language === "en";
  const text = (zh, en) => (isEnglish ? en : zh);
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
    if (placeholder)
      placeholder.textContent =
        ui.mapLoading ||
        text("正在加载全球访问分布…", "Loading the global visitor map…");

    const iframe = document.createElement("iframe");
    iframe.className = "mapmyvisitors-embed";
    iframe.title =
      ui.mapTitle || text("全球访问来源地图", "Global visitor map");
    iframe.loading = "eager";
    iframe.src = source;

    const fitFrameToContent = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        const contentHeight = Math.max(
          doc.documentElement?.scrollHeight || 0,
          doc.body?.scrollHeight || 0,
          250,
        );
        const nextHeight = Math.max(Math.ceil(contentHeight + 8), 250);
        iframe.style.height = `${nextHeight}px`;
        frame.style.minHeight = `${nextHeight}px`;
      } catch {
        iframe.style.height = "300px";
      }
    };

    const showFailure = () => {
      frame.dataset.loading = "false";
      if (placeholder)
        placeholder.textContent =
          ui.mapFailure ||
          text(
            "全球访问地图暂时无法加载，请稍后刷新。",
            "The visitor map is temporarily unavailable. Please refresh later.",
          );
    };

    const timeout = window.setTimeout(showFailure, 15000);
    iframe.addEventListener(
      "load",
      () => {
        window.clearTimeout(timeout);
        frame.dataset.loading = "false";
        placeholder?.remove();
        [0, 250, 900, 2200].forEach((delay) =>
          window.setTimeout(fitFrameToContent, delay),
        );
        try {
          const body = iframe.contentDocument?.body;
          if (body && "ResizeObserver" in window) {
            const observer = new ResizeObserver(fitFrameToContent);
            observer.observe(body);
          }
        } catch {
          // The fixed fallback height still keeps the map visible.
        }
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
