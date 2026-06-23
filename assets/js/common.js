/**
 * Shared page interactions: navigation, theme, canvas effects, lightbox and filters.
 * Page-specific content rendering belongs in render.js.
 */
(() => {
  "use strict";

  const {
    isLowPowerDevice,
    normalizeText,
    prefersReducedMotion,
    query,
    queryAll,
  } = window.ZHAI_UTILS;
  const language = document.documentElement.lang.toLowerCase().startsWith("en")
    ? "en"
    : "zh";
  const ui = window.ZHAI_I18N?.[language]?.ui || {};
  const isEnglish = language === "en";
  const text = (zh, en) => (isEnglish ? en : zh);

  function initMobileNavigation() {
    const toggle = query(".nav-toggle");
    const menu = query("#siteMenu");
    if (!toggle || !menu) return;

    const setOpen = (open) => {
      menu.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? (ui.navClose || text("关闭导航菜单", "Close navigation menu")) : (ui.navOpen || text("打开导航菜单", "Open navigation menu")));
      document.body.classList.toggle("menu-open", open);
    };

    toggle.addEventListener("click", () =>
      setOpen(!menu.classList.contains("open")),
    );
    queryAll("a", menu).forEach((link) =>
      link.addEventListener("click", () => setOpen(false)),
    );
    document.addEventListener("click", (event) => {
      if (!menu.classList.contains("open")) return;
      if (!menu.contains(event.target) && !toggle.contains(event.target))
        setOpen(false);
    });
    window.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !menu.classList.contains("open")) return;
      setOpen(false);
      toggle.focus();
    });
    window.addEventListener(
      "resize",
      () => {
        if (window.innerWidth > 860) setOpen(false);
      },
      { passive: true },
    );
  }

  function initHashNavigation() {
    const tabs = queryAll('.page-tabs a[href*="#"]');

    const syncHash = () => {
      const id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      if (!id) return;

      const target = document.getElementById(id);
      if (target)
        requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));

      tabs.forEach((tab) => {
        const tabHash = new URL(tab.href, window.location.href).hash.replace(
          /^#/,
          "",
        );
        tab.classList.toggle("active", tabHash === id);
      });
    };

    if (window.location.hash) syncHash();
    window.addEventListener("hashchange", syncHash);
  }

  function initTheme() {
    const root = document.documentElement;
    const toggle = query("[data-theme-toggle]");
    let savedTheme = null;

    try {
      savedTheme = localStorage.getItem("zhai-lab-theme");
    } catch {
      savedTheme = null;
    }

    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";

    const applyTheme = (theme) => {
      root.dataset.theme = theme;
      root.style.colorScheme = theme;
      document.body.dataset.theme = theme;

      const themeColor = query('meta[name="theme-color"]');
      if (themeColor)
        themeColor.content = theme === "dark" ? "#0c1220" : "#f7f5f1";
      if (!toggle) return;

      toggle.setAttribute("aria-pressed", String(theme === "dark"));
      const icon = query(".theme-icon", toggle);
      const label = query(".theme-label", toggle);
      if (icon) icon.textContent = theme === "dark" ? "☼" : "◐";
      if (label) label.textContent = theme === "dark" ? (ui.lightMode || text("浅色", "Light")) : (ui.darkMode || text("深色", "Dark"));
    };

    applyTheme(savedTheme || systemTheme);
    if (!toggle) return;

    toggle.addEventListener("click", () => {
      const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("zhai-lab-theme", nextTheme);
      } catch {
        // The selected theme still applies for the current page view.
      }
      applyTheme(nextTheme);
    });
  }

  function initLanguageSwitch() {
    queryAll("[data-language-switch]").forEach((link) => {
      const syncHash = () => {
        const base = link.dataset.languageTarget || link.getAttribute("href") || "";
        if (!base) return;
        const cleanBase = base.split("#")[0];
        link.href = `${cleanBase}${window.location.hash || ""}`;
      };
      syncHash();
      window.addEventListener("hashchange", syncHash, { passive: true });
    });
  }

  function initScrollUI() {
    const progress = query(".scroll-progress");
    const backToTop = query(".back-to-top");
    let scheduled = false;

    const update = () => {
      scheduled = false;
      const root = document.documentElement;
      const scrollRange = Math.max(root.scrollHeight - root.clientHeight, 1);
      const ratio = Math.min(1, Math.max(0, root.scrollTop / scrollRange));
      if (progress) progress.style.transform = `scaleX(${ratio})`;
      if (backToTop) backToTop.classList.toggle("show", root.scrollTop > 420);
    };

    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(update);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    update();

    if (backToTop) {
      backToTop.addEventListener("click", () => {
        window.scrollTo({
          top: 0,
          behavior: prefersReducedMotion() ? "auto" : "smooth",
        });
      });
    }
  }

  function initCursorParticles() {
    const canvas = query(".cursor-particles");
    if (!canvas || isLowPowerDevice(4) || prefersReducedMotion()) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const hero = query(".hero, .page-hero");
    const globalOnHome = document.body.classList.contains("page-home");
    const palette = ["28,80,132", "167,45,58", "184,145,66", "40,109,114"];
    const particles = [];
    let pointerInHero = globalOnHome || (hero ? hero.matches(":hover") : false);
    let width = 0;
    let height = 0;
    let lastParticleTime = 0;
    let animationFrame = 0;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const scheduleDraw = () => {
      if (!animationFrame && !document.hidden)
        animationFrame = requestAnimationFrame(draw);
    };

    const addParticle = (x, y) => {
      if (particles.length > 54) particles.shift();
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.26 + Math.random() * 0.7;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.08,
        radius: 1.25 + Math.random() * 2.05,
        life: 1,
        color: palette[Math.floor(Math.random() * palette.length)],
      });
      scheduleDraw();
    };

    function draw() {
      animationFrame = 0;
      context.clearRect(0, 0, width, height);

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.004;
        particle.life -= 0.012;

        if (particle.life <= 0) {
          particles.splice(index, 1);
          continue;
        }

        context.beginPath();
        context.fillStyle = `rgba(${particle.color}, ${0.29 * particle.life})`;
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
      }

      if (particles.length) scheduleDraw();
    }

    window.addEventListener("resize", resize, { passive: true });
    if (hero) {
      hero.addEventListener("pointerenter", () => {
        pointerInHero = true;
      });
      hero.addEventListener("pointerleave", () => {
        pointerInHero = false;
      });
    }
    window.addEventListener(
      "mousemove",
      (event) => {
        if (!globalOnHome && hero && !pointerInHero) return;
        const now = performance.now();
        if (now - lastParticleTime < 24) return;
        lastParticleTime = now;
        addParticle(event.clientX, event.clientY);
      },
      { passive: true },
    );
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      } else if (particles.length) {
        scheduleDraw();
      }
    });

    resize();
  }

  function initFlowBackground() {
    const canvas = query("#flow-bg");
    if (!canvas || isLowPowerDevice(3) || prefersReducedMotion()) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const frameInterval = 1000 / 22;
    let width = 0;
    let height = 0;
    let time = 0;
    let animationFrame = 0;
    let lastFrame = 0;
    let inActiveRange = true;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const drawStreamline = (startY, phase, alpha) => {
      context.beginPath();
      for (let x = -40; x <= width + 40; x += 16) {
        const y =
          startY +
          Math.sin(x * 0.0086 + phase + time * 0.009) * 19 +
          Math.sin(x * 0.017 - phase + time * 0.0065) * 8.5;
        if (x === -40) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.strokeStyle =
        document.body.dataset.theme === "dark"
          ? `rgba(107, 182, 255, ${alpha + 0.045})`
          : `rgba(28, 80, 132, ${alpha})`;
      context.lineWidth = 1.25;
      context.stroke();
    };

    const start = () => {
      if (!animationFrame && !document.hidden && inActiveRange) {
        animationFrame = requestAnimationFrame(draw);
      }
    };

    function draw(now) {
      animationFrame = 0;
      if (document.hidden || !inActiveRange) return;

      if (now - lastFrame >= frameInterval) {
        context.clearRect(0, 0, width, height);
        for (let index = 0; index < 13; index += 1) {
          drawStreamline(
            (height / 14) * (index + 1),
            index * 0.82,
            0.082 + (index % 4) * 0.009,
          );
        }
        time += 1;
        lastFrame = now;
      }
      animationFrame = requestAnimationFrame(draw);
    }

    const updateActiveRange = () => {
      inActiveRange = true;
      start();
    };

    window.addEventListener(
      "resize",
      () => {
        resize();
        updateActiveRange();
      },
      { passive: true },
    );
    window.addEventListener("scroll", updateActiveRange, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      } else {
        start();
      }
    });

    resize();
    if ("requestIdleCallback" in window)
      window.requestIdleCallback(start, { timeout: 1000 });
    else window.setTimeout(start, 180);
  }

  function initLightbox() {
    const lightbox = query(".lightbox");
    const image = lightbox ? query("img", lightbox) : null;
    const closeButton = lightbox ? query(".lightbox-close", lightbox) : null;
    if (!lightbox || !image) return;

    let returnFocus = null;

    const open = (source, alt, trigger) => {
      returnFocus = trigger || document.activeElement;
      image.src = source;
      image.alt = alt || ui.imagePreview || text("预览图片", "Image preview");
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("lightbox-open");
      if (closeButton) closeButton.focus();
    };

    const close = () => {
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lightbox-open");
      image.removeAttribute("src");
      if (returnFocus && typeof returnFocus.focus === "function")
        returnFocus.focus();
      returnFocus = null;
    };

    queryAll(
      "img[data-lightbox], .person-card img, .alumni-card img, .showcase-figure img, .pi-photo",
    ).forEach((trigger) => {
      trigger.tabIndex = 0;
      trigger.setAttribute("role", "button");
      trigger.addEventListener("click", () =>
        open(trigger.currentSrc || trigger.src, trigger.alt, trigger),
      );
      trigger.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        open(trigger.currentSrc || trigger.src, trigger.alt, trigger);
      });
    });

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) close();
    });
    if (closeButton) closeButton.addEventListener("click", close);
    window.addEventListener("keydown", (event) => {
      if (!lightbox.classList.contains("open")) return;
      if (event.key === "Escape") close();
      if (event.key === "Tab" && closeButton) {
        event.preventDefault();
        closeButton.focus();
      }
    });
  }

  function initPersonCards() {
    const cards = queryAll(".person-card");
    if (!cards.length) return;

    const interactiveSelector =
      'a, button, [role="button"], input, select, textarea, [tabindex]';

    const setFlipped = (card, flipped, moveFocus = false) => {
      card.classList.toggle("is-flipped", flipped);
      queryAll("[data-person-card-toggle]", card).forEach((button) => {
        button.setAttribute("aria-expanded", String(flipped));
      });

      const front = query(".person-face.front", card);
      const back = query(".person-face.back", card);
      if (front) {
        queryAll(interactiveSelector, front).forEach((node) => {
          node.tabIndex = flipped ? -1 : 0;
        });
      }
      if (back) {
        queryAll(interactiveSelector, back).forEach((node) => {
          node.tabIndex = flipped ? 0 : -1;
        });
      }

      if (!moveFocus) return;
      const target = flipped
        ? query(".person-card-return", card)
        : query(".person-face.front .person-card-toggle", card);
      if (target) target.focus();
    };

    cards.forEach((card) => {
      setFlipped(card, false);
      queryAll("[data-person-card-toggle]", card).forEach((button) => {
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          setFlipped(card, !card.classList.contains("is-flipped"), true);
        });
      });
    });

    document.addEventListener("click", (event) => {
      cards.forEach((card) => {
        if (
          card.classList.contains("is-flipped") &&
          !card.contains(event.target)
        ) {
          setFlipped(card, false);
        }
      });
    });
  }

  function initRMIFreezeEasterEgg() {
    const card = query('.person-card[data-person-id="chen-chenren"]');
    if (!card) return;

    const interactiveSelector =
      'a, button, input, select, textarea, [role="button"], [data-lightbox]';
    const clickWindow = 1800;
    const freezeDuration = 1500;
    let clickCount = 0;
    let resetTimer = 0;
    let freezeTimer = 0;

    const resetClicks = () => {
      clickCount = 0;
      window.clearTimeout(resetTimer);
      resetTimer = 0;
    };

    const triggerFreeze = () => {
      if (document.body.classList.contains("rmi-freeze-active")) return;

      let overlay = query("[data-rmi-freeze-overlay]");
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "rmi-freeze-overlay";
        overlay.dataset.rmiFreezeOverlay = "";
        overlay.setAttribute("aria-live", "assertive");
        overlay.setAttribute("aria-atomic", "true");
        overlay.innerHTML = `
          <div class="rmi-freeze-crystals" aria-hidden="true"></div>
          <p class="rmi-freeze-title">${ui.freezeTitle || text("RM不稳定性冻结", "RM Instability Frozen")}</p>
        `;
        document.body.appendChild(overlay);
      }

      document.body.classList.add("rmi-freeze-active");
      overlay.classList.remove("is-visible");
      void overlay.offsetWidth;
      overlay.classList.add("is-visible");

      window.clearTimeout(freezeTimer);
      freezeTimer = window.setTimeout(() => {
        document.body.classList.remove("rmi-freeze-active");
        overlay.classList.remove("is-visible");
      }, freezeDuration);
    };

    card.addEventListener("click", (event) => {
      if (event.target.closest(interactiveSelector)) return;

      clickCount += 1;
      window.clearTimeout(resetTimer);

      if (clickCount >= 3) {
        resetClicks();
        triggerFreeze();
        return;
      }

      resetTimer = window.setTimeout(resetClicks, clickWindow);
    });
  }

  function initRevealOnScroll() {
    const nodes = queryAll(".reveal");
    if (!nodes.length || prefersReducedMotion()) {
      nodes.forEach((node) => node.classList.add("in-view"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 },
    );
    nodes.forEach((node) => observer.observe(node));
  }

  function initPublicationFilters() {
    const buttons = queryAll("[data-filter]");
    const cards = queryAll("[data-pub-card]");
    if (!buttons.length || !cards.length) return;

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter;
        buttons.forEach((item) =>
          item.classList.toggle("active", item === button),
        );
        cards.forEach((card) => {
          const values = `${card.dataset.year || ""} ${card.dataset.category || ""} ${card.dataset.journal || ""}`;
          card.hidden = filter !== "all" && !values.includes(filter);
        });
      });
    });
  }

  function initSectionNavigator() {
    const navigatorElement = query(".section-navigator");
    if (!navigatorElement) return;

    const links = queryAll("[data-section-link]", navigatorElement);
    const sections = links
      .map((link) => document.getElementById(link.dataset.sectionLink))
      .filter(Boolean);
    if (!sections.length) return;

    const setActive = (id) => {
      links.forEach((link) =>
        link.classList.toggle("active", link.dataset.sectionLink === id),
      );
    };
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      {
        rootMargin: "-24% 0px -58% 0px",
        threshold: [0.08, 0.16, 0.28, 0.42],
      },
    );
    sections.forEach((section) => observer.observe(section));
  }

  function initPublicationSearch() {
    const input = query("[data-publication-search]");
    const cards = queryAll("[data-pub-card]");
    const groups = queryAll("[data-year-group]");
    const count = query("[data-publication-count]");
    const empty = query("[data-publication-empty]");
    if (!input || !cards.length) return;

    const update = () => {
      const searchTerm = normalizeText(input.value);
      let visibleCount = 0;

      cards.forEach((card) => {
        const content = normalizeText(card.dataset.search || card.textContent);
        const visible = !searchTerm || content.includes(searchTerm);
        card.hidden = !visible;

        if (!visible) return;
        visibleCount += 1;
        const index = query(".publication-number-value", card);
        if (index) index.textContent = String(visibleCount);
      });

      groups.forEach((group) => {
        group.hidden = !queryAll("[data-pub-card]", group).some(
          (card) => !card.hidden,
        );
      });
      if (count) count.textContent = String(visibleCount);
      if (empty) empty.hidden = visibleCount !== 0;
    };

    input.addEventListener("input", update);
    update();

    const yearLinks = queryAll("[data-year-jump]");
    const yearSections = yearLinks
      .map((link) => document.getElementById(`y${link.dataset.year}`))
      .filter(Boolean);
    if (!yearSections.length) return;

    const setYear = (id) => {
      yearLinks.forEach((link) => {
        link.classList.toggle("active", `y${link.dataset.year}` === id);
      });
    };
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setYear(visible.target.id);
      },
      { rootMargin: "-16% 0px -68% 0px", threshold: [0.05, 0.12, 0.25] },
    );
    yearSections.forEach((section) => observer.observe(section));
  }

  function initCopyEmailButtons() {
    const mailLinks = queryAll('.person-card a.mail[href^="mailto:"]');
    if (!mailLinks.length) return;

    const copyText = async (text) => {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
      }

      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    };

    mailLinks.forEach((link) => {
      if (link.nextElementSibling?.classList.contains("copy-email")) return;

      const email = link
        .getAttribute("href")
        .replace(/^mailto:/i, "")
        .trim();
      const button = document.createElement("button");
      button.className = "copy-email";
      button.type = "button";
      button.textContent = ui.copyEmail || text("复制邮箱", "Copy email");
      button.setAttribute("aria-label", `${ui.copyEmail || text("复制邮箱", "Copy email")} ${email}`);
      button.addEventListener("click", async () => {
        try {
          await copyText(email);
          button.textContent = ui.copied || text("已复制", "Copied");
          button.classList.add("copied");
          window.setTimeout(() => {
            button.textContent = ui.copyEmail || text("复制邮箱", "Copy email");
            button.classList.remove("copied");
          }, 1600);
        } catch {
          button.textContent = ui.copyFailed || text("复制失败", "Copy failed");
          window.setTimeout(() => {
            button.textContent = ui.copyEmail || text("复制邮箱", "Copy email");
          }, 1600);
        }
      });
      link.insertAdjacentElement("afterend", button);
    });
  }

  [
    initMobileNavigation,
    initHashNavigation,
    initTheme,
    initLanguageSwitch,
    initScrollUI,
    initCursorParticles,
    initFlowBackground,
    initLightbox,
    initPersonCards,
    initRMIFreezeEasterEgg,
    initRevealOnScroll,
    initPublicationFilters,
    initSectionNavigator,
    initPublicationSearch,
    initCopyEmailButtons,
  ].forEach((initialize) => initialize());
})();
