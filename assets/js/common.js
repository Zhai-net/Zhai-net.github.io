// GENERATED FILE. Edit src/js/common/*.js and run npm run build.

(() => {
  'use strict';

  // Source: src/js/common/utils.js
  const RUNTIME_SITE = window.ZHAI_SITE && typeof window.ZHAI_SITE === 'object' ? window.ZHAI_SITE : {};
  const BREAKPOINTS = Object.freeze({ mobileNavigation: 860 });
  const THEME_STORAGE_KEY = RUNTIME_SITE.themeStorageKey || 'zhai-lab-theme';
  const THEME_COLORS = Object.freeze(RUNTIME_SITE.themeColors || { light: '#f7f5f1', dark: '#0c1220' });
  
  const query = (selector, context = document) => context.querySelector(selector);
  const queryAll = (selector, context = document) => Array.from(context.querySelectorAll(selector));
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const pad2 = (value) => String(value).padStart(2, '0');
  
  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasCoarsePointer = () => window.matchMedia('(pointer: coarse)').matches;
  
  function isLowPowerDevice(memoryThreshold = 4) {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return Boolean(
      (connection && connection.saveData)
      || (navigator.deviceMemory && navigator.deviceMemory <= memoryThreshold)
    );
  }
  
  function normalizeSearchText(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u2010-\u2015]/g, '-')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
  
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.readOnly = true;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    if (!copied) throw new Error('Copy command failed');
  }
  
  // Source: src/js/common/navigation.js
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
  
  // Source: src/js/common/theme.js
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
  
  // Source: src/js/common/scroll-ui.js
  function initScrollUI() {
    const progress = query('.scroll-progress');
    const backToTop = query('.back-to-top');
    if ((!progress && !backToTop) || document.documentElement.dataset.scrollUiInitialized === 'true') return;
    document.documentElement.dataset.scrollUiInitialized = 'true';
  
    let framePending = false;
    const update = () => {
      framePending = false;
      const root = document.documentElement;
      const scrollable = Math.max(root.scrollHeight - root.clientHeight, 1);
      const ratio = clamp(root.scrollTop / scrollable, 0, 1);
      if (progress) progress.style.transform = `scaleX(${ratio})`;
      if (backToTop) backToTop.classList.toggle('show', root.scrollTop > 420);
    };
    const scheduleUpdate = () => {
      if (framePending) return;
      framePending = true;
      requestAnimationFrame(update);
    };
  
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    backToTop?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    });
    update();
  }
  
  // Source: src/js/common/cursor-particles.js
  function initCursorParticles() {
    const canvas = query('.cursor-particles');
    if (!canvas || canvas.dataset.initialized === 'true') return;
    canvas.dataset.initialized = 'true';
    if (isLowPowerDevice(4) || prefersReducedMotion() || hasCoarsePointer()) return;
  
    const context = canvas.getContext('2d');
    if (!context) return;
    const hero = query('.hero, .page-hero');
    const colors = ['28,80,132', '167,45,58', '184,145,66', '40,109,114'];
    const particles = [];
    let width = 0;
    let height = 0;
    let lastCreatedAt = 0;
    let animationFrame = 0;
    let pointerInHero = hero ? hero.matches(':hover') : false;
  
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
  
    const scheduleDraw = () => {
      if (!animationFrame && !document.hidden) animationFrame = requestAnimationFrame(draw);
    };
  
    const addParticle = (x, y) => {
      if (particles.length >= 42) particles.shift();
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.22 + Math.random() * 0.58;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.08,
        radius: 1 + Math.random() * 1.9,
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)]
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
        particle.life -= 0.014;
        if (particle.life <= 0) {
          particles.splice(index, 1);
          continue;
        }
        context.beginPath();
        context.fillStyle = `rgba(${particle.color}, ${0.20 * particle.life})`;
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
      }
      if (particles.length) scheduleDraw();
    }
  
    window.addEventListener('resize', resize, { passive: true });
    hero?.addEventListener('pointerenter', () => { pointerInHero = true; }, { passive: true });
    hero?.addEventListener('pointerleave', () => { pointerInHero = false; }, { passive: true });
    window.addEventListener('mousemove', (event) => {
      if (hero && !pointerInHero) return;
      const now = performance.now();
      if (now - lastCreatedAt < 22) return;
      lastCreatedAt = now;
      addParticle(event.clientX, event.clientY);
    }, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      } else if (particles.length) {
        scheduleDraw();
      }
    });
    resize();
  }
  
  // Source: src/js/common/flow-background.js
  function initFlowBackground() {
    const canvas = query('#flow-bg');
    if (!canvas || canvas.dataset.initialized === 'true') return;
    canvas.dataset.initialized = 'true';
    if (isLowPowerDevice(3) || prefersReducedMotion()) return;
  
    const context = canvas.getContext('2d');
    if (!context) return;
    const frameInterval = 1000 / 30;
    let width = 0;
    let height = 0;
    let time = 0;
    let animationFrame = 0;
    let lastFrame = 0;
  
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
  
    const drawStreamline = (originY, phase, alpha) => {
      context.beginPath();
      for (let x = -40; x <= width + 40; x += 16) {
        const y = originY
          + Math.sin(x * 0.009 + phase + time * 0.010) * 18
          + Math.sin(x * 0.018 - phase + time * 0.007) * 8;
        if (x === -40) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      const darkTheme = document.documentElement.dataset.theme === 'dark';
      context.strokeStyle = darkTheme
        ? `rgba(107, 182, 255, ${alpha + 0.04})`
        : `rgba(28, 80, 132, ${alpha})`;
      context.lineWidth = 1.35;
      context.stroke();
    };
  
    function draw(now) {
      animationFrame = 0;
      if (document.hidden) return;
      if (now - lastFrame >= frameInterval) {
        context.clearRect(0, 0, width, height);
        for (let index = 0; index < 16; index += 1) {
          drawStreamline((height / 17) * (index + 1), index * 0.72, 0.075 + (index % 4) * 0.012);
        }
        time += 1;
        lastFrame = now;
      }
      animationFrame = requestAnimationFrame(draw);
    }
  
    const start = () => {
      if (!animationFrame && !document.hidden) animationFrame = requestAnimationFrame(draw);
    };
  
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      } else {
        start();
      }
    });
    resize();
    if ('requestIdleCallback' in window) window.requestIdleCallback(start, { timeout: 1000 });
    else window.setTimeout(start, 180);
  }
  
  // Source: src/js/common/lightbox.js
  const LIGHTBOX_TRIGGER_SELECTOR = 'img[data-lightbox], .person-card img, .alumni-card img, .showcase-figure img, .pi-photo';
  
  function prepareLightboxTriggers() {
    queryAll(LIGHTBOX_TRIGGER_SELECTOR).forEach((image) => {
      if (image.dataset.lightboxPrepared === 'true') return;
      image.dataset.lightboxPrepared = 'true';
      image.tabIndex = 0;
      image.setAttribute('role', 'button');
      if (!image.getAttribute('aria-label')) {
        image.setAttribute('aria-label', `${image.alt || '图片'}，点击放大`);
      }
    });
  }
  
  function initLightbox() {
    const lightbox = query('.lightbox');
    const preview = lightbox ? query('img', lightbox) : null;
    const closeButton = lightbox ? query('.lightbox-close', lightbox) : null;
    if (!lightbox || !preview || lightbox.dataset.initialized === 'true') return;
    lightbox.dataset.initialized = 'true';
    let returnFocus = null;
  
    const open = (image) => {
      returnFocus = image;
      preview.src = image.currentSrc || image.src;
      preview.alt = image.alt || '预览图片';
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');
      closeButton?.focus();
    };
  
    const close = () => {
      if (!lightbox.classList.contains('open')) return;
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lightbox-open');
      preview.removeAttribute('src');
      returnFocus?.focus?.();
      returnFocus = null;
    };
  
    document.addEventListener('click', (event) => {
      const image = event.target.closest(LIGHTBOX_TRIGGER_SELECTOR);
      if (image) open(image);
    });
    document.addEventListener('keydown', (event) => {
      const image = event.target.closest?.(LIGHTBOX_TRIGGER_SELECTOR);
      if (image && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        open(image);
        return;
      }
      if (!lightbox.classList.contains('open')) return;
      if (event.key === 'Escape') close();
      if (event.key === 'Tab' && closeButton) {
        event.preventDefault();
        closeButton.focus();
      }
    });
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) close();
    });
    closeButton?.addEventListener('click', close);
  }
  
  // Source: src/js/common/person-cards.js
  const CARD_INTERACTIVE_SELECTOR = 'a, button, [role="button"], input, select, textarea, [tabindex]';
  
  function setPersonCardFlipped(card, flipped, moveFocus = false) {
    card.classList.toggle('is-flipped', flipped);
    queryAll('[data-person-card-toggle]', card).forEach((button) => {
      button.setAttribute('aria-expanded', String(flipped));
    });
  
    const front = query('.person-face.front', card);
    const back = query('.person-face.back', card);
    queryAll(CARD_INTERACTIVE_SELECTOR, front || document.createElement('div'))
      .forEach((node) => { node.tabIndex = flipped ? -1 : 0; });
    queryAll(CARD_INTERACTIVE_SELECTOR, back || document.createElement('div'))
      .forEach((node) => { node.tabIndex = flipped ? 0 : -1; });
  
    if (!moveFocus) return;
    const target = flipped
      ? query('.person-card-return', card)
      : query('.person-face.front .person-card-toggle', card);
    target?.focus();
  }
  
  function preparePersonCards() {
    queryAll('.person-card').forEach((card) => {
      if (card.dataset.cardPrepared === 'true') return;
      card.dataset.cardPrepared = 'true';
      setPersonCardFlipped(card, false);
    });
  }
  
  function initPersonCards() {
    if (document.documentElement.dataset.personCardsInitialized === 'true') return;
    document.documentElement.dataset.personCardsInitialized = 'true';
  
    document.addEventListener('click', (event) => {
      const toggle = event.target.closest('[data-person-card-toggle]');
      if (toggle) {
        event.stopPropagation();
        const card = toggle.closest('.person-card');
        if (card) setPersonCardFlipped(card, !card.classList.contains('is-flipped'), true);
        return;
      }
  
      queryAll('.person-card.is-flipped').forEach((card) => {
        if (!card.contains(event.target)) setPersonCardFlipped(card, false);
      });
    });
  }
  
  // Source: src/js/common/reveal.js
  let revealObserver = null;
  
  function prepareRevealNodes() {
    const nodes = queryAll('.reveal:not([data-reveal-prepared])');
    if (!nodes.length) return;
    nodes.forEach((node) => { node.dataset.revealPrepared = 'true'; });
  
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('in-view'));
      return;
    }
  
    if (!revealObserver) {
      revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.12 });
    }
    nodes.forEach((node) => revealObserver.observe(node));
  }
  
  // Source: src/js/common/section-navigator.js
  function initSectionNavigator() {
    const navigatorElement = query('.section-navigator');
    if (!navigatorElement || navigatorElement.dataset.initialized === 'true') return;
    navigatorElement.dataset.initialized = 'true';
  
    const links = queryAll('[data-section-link]', navigatorElement);
    const sections = links
      .map((link) => document.getElementById(link.dataset.sectionLink))
      .filter(Boolean);
    if (!sections.length || !('IntersectionObserver' in window)) return;
  
    const setActive = (id) => {
      links.forEach((link) => {
        const active = link.dataset.sectionLink === id;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    };
  
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];
      if (visible) setActive(visible.target.id);
    }, { rootMargin: '-24% 0px -58% 0px', threshold: [0.08, 0.16, 0.28, 0.42] });
  
    sections.forEach((section) => observer.observe(section));
  }
  
  // Source: src/js/common/publications.js
  function initPublicationControls() {
    const input = query('[data-publication-search]');
    if (!input || input.dataset.initialized === 'true') return;
  
    const cards = queryAll('[data-pub-card]');
    const groups = queryAll('[data-year-group]');
    if (!cards.length) return;
    input.dataset.initialized = 'true';
  
    const count = query('[data-publication-count]');
    const empty = query('[data-publication-empty]');
    const yearLinks = queryAll('[data-year-jump]');
  
    const update = () => {
      const searchTerm = normalizeSearchText(input.value);
      let visibleCount = 0;
  
      cards.forEach((card) => {
        const haystack = normalizeSearchText(card.dataset.search || card.textContent);
        const visible = !searchTerm || haystack.includes(searchTerm);
        card.hidden = !visible;
        if (!visible) return;
        visibleCount += 1;
        const indexNode = query('.year', card);
        if (indexNode) indexNode.textContent = pad2(visibleCount);
      });
  
      groups.forEach((group) => {
        group.hidden = !queryAll('[data-pub-card]', group).some((card) => !card.hidden);
      });
      if (count) count.textContent = String(visibleCount);
      if (empty) empty.hidden = visibleCount !== 0;
    };
  
    input.addEventListener('input', update);
    update();
  
    const yearSections = yearLinks
      .map((link) => document.getElementById(`y${link.dataset.year}`))
      .filter(Boolean);
    if (!yearSections.length || !('IntersectionObserver' in window)) return;
  
    const setActiveYear = (id) => {
      yearLinks.forEach((link) => {
        const active = `y${link.dataset.year}` === id;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    };
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];
      if (visible) setActiveYear(visible.target.id);
    }, { rootMargin: '-16% 0px -68% 0px', threshold: [0.05, 0.12, 0.25] });
    yearSections.forEach((section) => observer.observe(section));
  }
  
  // Source: src/js/common/email-copy.js
  function prepareEmailCopyButtons() {
    queryAll('.person-card a.mail[href^="mailto:"]').forEach((link) => {
      if (link.nextElementSibling?.classList.contains('copy-email')) return;
      const email = link.href.replace(/^mailto:/i, '').trim();
      const button = document.createElement('button');
      button.className = 'copy-email';
      button.type = 'button';
      button.dataset.copyEmail = email;
      button.textContent = '复制邮箱';
      button.setAttribute('aria-label', `复制邮箱 ${email}`);
      link.insertAdjacentElement('afterend', button);
    });
  }
  
  function initEmailCopy() {
    if (document.documentElement.dataset.emailCopyInitialized === 'true') return;
    document.documentElement.dataset.emailCopyInitialized = 'true';
  
    document.addEventListener('click', async (event) => {
      const button = event.target.closest('[data-copy-email]');
      if (!button) return;
      const originalText = '复制邮箱';
      try {
        await copyText(button.dataset.copyEmail);
        button.textContent = '已复制';
        button.classList.add('copied');
      } catch (error) {
        button.textContent = '复制失败';
      }
      window.setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('copied');
      }, 1600);
    });
  }
  
  // Source: src/js/common/hash-links.js
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
  
  // Source: src/js/common/main.js
  function prepareDynamicContent() {
    prepareLightboxTriggers();
    preparePersonCards();
    prepareRevealNodes();
    prepareEmailCopyButtons();
    initPublicationControls();
  }
  
  function initCommon() {
    initMobileNavigation();
    initThemeToggle();
    initScrollUI();
    initCursorParticles();
    initFlowBackground();
    initLightbox();
    initPersonCards();
    initSectionNavigator();
    initEmailCopy();
    initDynamicHashLinks();
    prepareDynamicContent();
    document.addEventListener('zhai:content-rendered', prepareDynamicContent);
  }
  
  initCommon();
})();
