const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('#siteMenu');

if (navToggle && navMenu) {
  const setMenuOpen = (open) => {
    navMenu.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
    document.body.classList.toggle('menu-open', open);
  };

  navToggle.addEventListener('click', () => {
    setMenuOpen(!navMenu.classList.contains('open'));
  });

  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  document.addEventListener('click', (event) => {
    if (!navMenu.classList.contains('open')) return;
    if (!navMenu.contains(event.target) && !navToggle.contains(event.target)) setMenuOpen(false);
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navMenu.classList.contains('open')) {
      setMenuOpen(false);
      navToggle.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) setMenuOpen(false);
  }, { passive: true });
}


// Restore direct links to sections that are created by the data-rendering layer.
(() => {
  const tabs = Array.from(document.querySelectorAll('.page-tabs a[href*="#"]'));

  const syncHash = () => {
    const id = decodeURIComponent(window.location.hash.replace(/^#/, ''));
    if (!id) return;
    const target = document.getElementById(id);
    if (target) {
      requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
    }
    tabs.forEach((tab) => {
      const tabHash = new URL(tab.href, window.location.href).hash.replace(/^#/, '');
      tab.classList.toggle('active', tabHash === id);
    });
  };

  if (window.location.hash) syncHash();
  window.addEventListener('hashchange', syncHash);
})();

// Theme switcher with persistence.
(() => {
  const root = document.documentElement;
  const toggle = document.querySelector('[data-theme-toggle]');
  let saved = null;
  try { saved = localStorage.getItem('zhai-lab-theme'); } catch (error) { saved = null; }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = saved || (prefersDark ? 'dark' : 'light');

  function applyTheme(theme) {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    if (document.body) document.body.dataset.theme = theme;
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = theme === 'dark' ? '#0c1220' : '#f7f5f1';
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(theme === 'dark'));
      toggle.querySelector('.theme-icon').textContent = theme === 'dark' ? '☀️' : '🌙';
      toggle.querySelector('.theme-label').textContent = theme === 'dark' ? '浅色' : '深色';
    }
  }

  applyTheme(initial);

  if (toggle) {
    toggle.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('zhai-lab-theme', next); } catch (error) { /* Theme still applies for this visit. */ }
      applyTheme(next);
    });
  }
})();

// Scroll progress bar + back-to-top button.
(() => {
  const progress = document.querySelector('.scroll-progress');
  const backTop = document.querySelector('.back-to-top');
  let scheduled = false;

  function updateScrollUI() {
    scheduled = false;
    const doc = document.documentElement;
    const max = Math.max(doc.scrollHeight - doc.clientHeight, 1);
    const percent = (doc.scrollTop / max) * 100;
    if (progress) progress.style.transform = `scaleX(${Math.min(1, Math.max(0, percent / 100))})`;
    if (backTop) backTop.classList.toggle('show', doc.scrollTop > 420);
  }

  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(updateScrollUI);
  }

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate, { passive: true });
  updateScrollUI();

  if (backTop) {
    backTop.addEventListener('click', () => {
      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      window.scrollTo({ top: 0, behavior });
    });
  }
})();

// Low-key cursor particles: render only while particles are active.
(() => {
  const canvas = document.querySelector('.cursor-particles');
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const lowPower = Boolean((connection && connection.saveData) || (navigator.deviceMemory && navigator.deviceMemory <= 4));
  if (!canvas || lowPower || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const hero = document.querySelector('.hero, .page-hero');
  let pointerInHero = hero ? hero.matches(':hover') : false;

  const ctx = canvas.getContext('2d');
  const palette = ['28,80,132', '167,45,58', '184,145,66', '40,109,114'];
  const particles = [];
  let width = 0;
  let height = 0;
  let last = 0;
  let animationFrame = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function scheduleDraw() {
    if (!animationFrame && !document.hidden) animationFrame = requestAnimationFrame(draw);
  }

  function addParticle(x, y) {
    if (particles.length > 42) particles.shift();
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.22 + Math.random() * 0.58;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.08,
      r: 1.0 + Math.random() * 1.9,
      life: 1,
      color: palette[Math.floor(Math.random() * palette.length)]
    });
    scheduleDraw();
  }

  function draw() {
    animationFrame = 0;
    ctx.clearRect(0, 0, width, height);
    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.004;
      p.life -= 0.014;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      ctx.beginPath();
      ctx.fillStyle = `rgba(${p.color}, ${0.20 * p.life})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (particles.length) scheduleDraw();
  }

  window.addEventListener('resize', resize, { passive: true });
  if (hero) {
    hero.addEventListener('pointerenter', () => { pointerInHero = true; }, { passive: true });
    hero.addEventListener('pointerleave', () => { pointerInHero = false; }, { passive: true });
  }
  window.addEventListener('mousemove', (event) => {
    if (hero && !pointerInHero) return;
    const now = performance.now();
    if (now - last < 22) return;
    last = now;
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
})();

// Subtle flow-line background, throttled to reduce CPU and battery use.
(() => {
  const canvas = document.querySelector('#flow-bg');
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const lowPower = Boolean((connection && connection.saveData) || (navigator.deviceMemory && navigator.deviceMemory <= 3));
  if (!canvas || lowPower || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let dpr = 1;
  let t = 0;
  let animationFrame = 0;
  let lastFrame = 0;
  const frameInterval = 1000 / 30;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawStreamline(y0, phase, alpha) {
    ctx.beginPath();
    for (let x = -40; x <= width + 40; x += 16) {
      const y = y0
        + Math.sin(x * 0.009 + phase + t * 0.010) * 18
        + Math.sin(x * 0.018 - phase + t * 0.007) * 8;
      if (x === -40) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(28, 80, 132, ${alpha})`;
    if (document.body.dataset.theme === 'dark') ctx.strokeStyle = `rgba(107, 182, 255, ${alpha + 0.04})`;
    ctx.lineWidth = 1.35;
    ctx.stroke();
  }

  function draw(now) {
    animationFrame = 0;
    if (document.hidden) return;
    if (now - lastFrame >= frameInterval) {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < 16; i += 1) {
        drawStreamline((height / 17) * (i + 1), i * 0.72, 0.075 + (i % 4) * 0.012);
      }
      t += 1;
      lastFrame = now;
    }
    animationFrame = requestAnimationFrame(draw);
  }

  function start() {
    if (!animationFrame && !document.hidden) animationFrame = requestAnimationFrame(draw);
  }

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
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(start, { timeout: 1000 });
  } else {
    window.setTimeout(start, 180);
  }
})();

// Image lightbox for portraits and research figures.
(() => {
  const lightbox = document.querySelector('.lightbox');
  const img = lightbox ? lightbox.querySelector('img') : null;
  const close = lightbox ? lightbox.querySelector('.lightbox-close') : null;
  if (!lightbox || !img) return;
  let returnFocus = null;

  function openLightbox(src, alt, trigger) {
    returnFocus = trigger || document.activeElement;
    img.src = src;
    img.alt = alt || '预览图片';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    if (close) close.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    img.removeAttribute('src');
    if (returnFocus && typeof returnFocus.focus === 'function') returnFocus.focus();
    returnFocus = null;
  }

  document.querySelectorAll('img[data-lightbox], .person-card img, .alumni-card img, .showcase-figure img, .pi-photo').forEach((node) => {
    node.tabIndex = 0;
    node.setAttribute('role', 'button');
    node.addEventListener('click', () => openLightbox(node.currentSrc || node.src, node.alt, node));
    node.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox(node.currentSrc || node.src, node.alt, node);
      }
    });
  });

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  if (close) close.addEventListener('click', closeLightbox);
  window.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'Tab' && close) {
      event.preventDefault();
      close.focus();
    }
  });
})();


// Touch- and keyboard-friendly member-card details.
(() => {
  const cards = Array.from(document.querySelectorAll('.person-card'));
  if (!cards.length) return;

  const interactiveSelector = 'a, button, [role="button"], input, select, textarea, [tabindex]';

  const setFlipped = (card, flipped, moveFocus = false) => {
    card.classList.toggle('is-flipped', flipped);
    card.querySelectorAll('[data-person-card-toggle]').forEach((button) => {
      button.setAttribute('aria-expanded', String(flipped));
    });

    const front = card.querySelector('.person-face.front');
    const back = card.querySelector('.person-face.back');
    if (front) front.querySelectorAll(interactiveSelector).forEach((node) => { node.tabIndex = flipped ? -1 : 0; });
    if (back) back.querySelectorAll(interactiveSelector).forEach((node) => { node.tabIndex = flipped ? 0 : -1; });

    if (moveFocus) {
      const target = flipped
        ? card.querySelector('.person-card-return')
        : card.querySelector('.person-face.front .person-card-toggle');
      if (target) target.focus();
    }
  };

  cards.forEach((card) => {
    setFlipped(card, false);
    card.querySelectorAll('[data-person-card-toggle]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        setFlipped(card, !card.classList.contains('is-flipped'), true);
      });
    });
  });

  document.addEventListener('click', (event) => {
    cards.forEach((card) => {
      if (card.classList.contains('is-flipped') && !card.contains(event.target)) setFlipped(card, false);
    });
  });
})();

// Reveal-on-scroll micro-interaction.
(() => {
  const nodes = document.querySelectorAll('.reveal');
  if (!nodes.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    nodes.forEach((node) => node.classList.add('in-view'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  nodes.forEach((node) => observer.observe(node));
})();

// Publication filters on the standalone publication page.
(() => {
  const buttons = document.querySelectorAll('[data-filter]');
  const cards = document.querySelectorAll('[data-pub-card]');
  if (!buttons.length || !cards.length) return;

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      buttons.forEach((btn) => btn.classList.toggle('active', btn === button));
      cards.forEach((card) => {
        const values = `${card.dataset.year || ''} ${card.dataset.category || ''} ${card.dataset.journal || ''}`;
        card.hidden = filter !== 'all' && !values.includes(filter);
      });
    });
  });
})();


// Homepage right-side section navigator.
(() => {
  const navigatorEl = document.querySelector('.section-navigator');
  if (!navigatorEl) return;
  const links = Array.from(navigatorEl.querySelectorAll('[data-section-link]'));
  const sections = links
    .map((link) => document.getElementById(link.dataset.sectionLink))
    .filter(Boolean);
  if (!sections.length) return;

  const setActive = (id) => {
    links.forEach((link) => link.classList.toggle('active', link.dataset.sectionLink === id));
  };

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActive(visible.target.id);
  }, { rootMargin: '-24% 0px -58% 0px', threshold: [0.08, 0.16, 0.28, 0.42] });

  sections.forEach((section) => observer.observe(section));
})();


// Publication search and year quick index.
(() => {
  const input = document.querySelector('[data-publication-search]');
  const cards = Array.from(document.querySelectorAll('[data-pub-card]'));
  const groups = Array.from(document.querySelectorAll('[data-year-group]'));
  const count = document.querySelector('[data-publication-count]');
  const empty = document.querySelector('[data-publication-empty]');
  if (!input || !cards.length) return;

  const normalize = (value) => (value || '')
    .toString()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
  const two = (n) => String(n).padStart(2, '0');

  const update = () => {
    const q = normalize(input.value);
    let visibleCount = 0;
    cards.forEach((card) => {
      const haystack = normalize(card.dataset.search || card.textContent);
      const show = !q || haystack.includes(q);
      card.hidden = !show;
      if (show) {
        visibleCount += 1;
        const indexNode = card.querySelector('.year');
        if (indexNode) indexNode.textContent = two(visibleCount);
      }
    });
    groups.forEach((group) => {
      const groupVisible = Array.from(group.querySelectorAll('[data-pub-card]')).some((card) => !card.hidden);
      group.hidden = !groupVisible;
    });
    if (count) count.textContent = String(visibleCount);
    if (empty) empty.hidden = visibleCount !== 0;
  };

  input.addEventListener('input', update);
  update();

  const yearLinks = Array.from(document.querySelectorAll('[data-year-jump]'));
  const yearSections = yearLinks.map((link) => document.getElementById(`y${link.dataset.year}`)).filter(Boolean);
  if (yearSections.length) {
    const setYear = (id) => yearLinks.forEach((link) => link.classList.toggle('active', `y${link.dataset.year}` === id));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setYear(visible.target.id);
    }, { rootMargin: '-16% 0px -68% 0px', threshold: [0.05, 0.12, 0.25] });
    yearSections.forEach((section) => observer.observe(section));
  }
})();

// Copy email buttons for member cards.
(() => {
  const mailLinks = Array.from(document.querySelectorAll('.person-card a.mail[href^="mailto:"]'));
  if (!mailLinks.length) return;

  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  };

  mailLinks.forEach((link) => {
    if (link.nextElementSibling && link.nextElementSibling.classList.contains('copy-email')) return;
    const email = link.getAttribute('href').replace(/^mailto:/i, '').trim();
    const button = document.createElement('button');
    button.className = 'copy-email';
    button.type = 'button';
    button.textContent = '复制邮箱';
    button.setAttribute('aria-label', `复制邮箱 ${email}`);
    button.addEventListener('click', async () => {
      try {
        await copyText(email);
        button.textContent = '已复制';
        button.classList.add('copied');
        window.setTimeout(() => {
          button.textContent = '复制邮箱';
          button.classList.remove('copied');
        }, 1600);
      } catch (error) {
        button.textContent = '复制失败';
        window.setTimeout(() => { button.textContent = '复制邮箱'; }, 1600);
      }
    });
    link.insertAdjacentElement('afterend', button);
  });
})();
