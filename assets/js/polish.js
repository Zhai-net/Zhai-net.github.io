/** Lightweight presentation refinements. Content data does not belong in this file. */
(() => {
  "use strict";

  const { prefersReducedMotion, query, queryAll } = window.ZHAI_UTILS;

  function initHeaderState() {
    const header = query(".site-header");
    if (!header) return;

    let scheduled = false;
    const update = () => {
      scheduled = false;
      header.classList.toggle("is-scrolled", window.scrollY > 18);
    };
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(update);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    update();
  }

  function initRevealDelays() {
    if (prefersReducedMotion()) return;

    const groupSelector = [
      ".career-grid",
      ".research-grid",
      ".gallery-grid",
      ".publication-list",
      ".people-grid",
      ".people-directory-grid",
      ".alumni-grid",
      ".timeline",
      ".panel-grid",
      ".visit-counts",
    ].join(",");

    queryAll(groupSelector).forEach((group) => {
      Array.from(group.children)
        .filter((node) => node.classList.contains("reveal"))
        .forEach((item, index) => {
          item.style.setProperty(
            "--reveal-delay",
            `${Math.min(index, 6) * 45}ms`,
          );
        });
    });
  }

  function initSectionAriaState() {
    const links = queryAll(".section-navigator [data-section-link]");
    if (!links.length) return;

    const sync = () => {
      links.forEach((link) => {
        if (link.classList.contains("active"))
          link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };

    const observer = new MutationObserver(sync);
    links.forEach((link) => {
      observer.observe(link, { attributes: true, attributeFilter: ["class"] });
    });
    sync();
  }

  function initLazyImageState() {
    queryAll('img[loading="lazy"]').forEach((image) => {
      const markLoaded = () => image.classList.add("is-loaded");
      if (image.complete) markLoaded();
      else image.addEventListener("load", markLoaded, { once: true });
    });
  }

  [
    initHeaderState,
    initRevealDelays,
    initSectionAriaState,
    initLazyImageState,
  ].forEach((initialize) => initialize());
})();
