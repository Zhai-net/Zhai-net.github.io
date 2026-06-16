const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('#siteMenu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Theme switcher with persistence.
(() => {
  const root = document.body;
  const toggle = document.querySelector('[data-theme-toggle]');
  const saved = localStorage.getItem('zhai-lab-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = saved || (prefersDark ? 'dark' : 'light');

  function applyTheme(theme) {
    root.dataset.theme = theme;
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
      localStorage.setItem('zhai-lab-theme', next);
      applyTheme(next);
    });
  }
})();

// Scroll progress bar + back-to-top button.
(() => {
  const progress = document.querySelector('.scroll-progress');
  const backTop = document.querySelector('.back-to-top');

  function updateScrollUI() {
    const doc = document.documentElement;
    const max = Math.max(doc.scrollHeight - doc.clientHeight, 1);
    const percent = (doc.scrollTop / max) * 100;
    if (progress) progress.style.width = `${percent}%`;
    if (backTop) backTop.classList.toggle('show', doc.scrollTop > 420);
  }

  window.addEventListener('scroll', updateScrollUI, { passive: true });
  window.addEventListener('resize', updateScrollUI, { passive: true });
  updateScrollUI();

  if (backTop) {
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
})();

// Low-key cursor particles: sparse and disabled on touch / reduced motion.
(() => {
  const canvas = document.querySelector('.cursor-particles');
  if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const ctx = canvas.getContext('2d');
  const palette = ['28,80,132', '167,45,58', '184,145,66', '40,109,114'];
  const particles = [];
  let width = 0;
  let height = 0;
  let last = 0;

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

  function addParticle(x, y) {
    if (particles.length > 70) particles.shift();
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
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('mousemove', (event) => {
    const now = performance.now();
    if (now - last < 22) return;
    last = now;
    addParticle(event.clientX, event.clientY);
  }, { passive: true });

  function draw() {
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
    requestAnimationFrame(draw);
  }

  resize();
  draw();
})();

// Subtle flow-line background for fluid-mechanics identity.
(() => {
  const canvas = document.querySelector('#flow-bg');
  if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let dpr = 1;
  let t = 0;

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

  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < 16; i += 1) {
      drawStreamline((height / 17) * (i + 1), i * 0.72, 0.075 + (i % 4) * 0.012);
    }
    t += 1;
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  draw();
})();

// Image lightbox for portraits and research figures.
(() => {
  const lightbox = document.querySelector('.lightbox');
  const img = lightbox ? lightbox.querySelector('img') : null;
  const close = lightbox ? lightbox.querySelector('.lightbox-close') : null;
  if (!lightbox || !img) return;

  function openLightbox(src, alt) {
    img.src = src;
    img.alt = alt || '预览图片';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    img.removeAttribute('src');
  }

  document.querySelectorAll('img[data-lightbox], .person-card img, .alumni-card img, .showcase-figure img, .pi-photo').forEach((node) => {
    node.addEventListener('click', () => openLightbox(node.currentSrc || node.src, node.alt));
  });

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  if (close) close.addEventListener('click', closeLightbox);
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
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


// Visitor IP map: client-side fallback for static deployments.
(() => {
  const mapCard = document.querySelector('[data-visitor-map-card]');
  const map = document.querySelector('[data-visitor-map]');
  const dot = document.querySelector('[data-visitor-map-dot]');
  const status = document.querySelector('[data-visitor-map-status]');
  const location = document.querySelector('[data-visitor-map-location]');
  const external = document.querySelector('[data-visitor-map-external]');
  const config = (window.ZHAI_SITE && window.ZHAI_SITE.visitorMap) || {};

  if (!mapCard || !map || !dot) return;

  const setStatus = (text) => { if (status) status.textContent = text; };
  const setLocation = (text) => { if (location) location.textContent = text; };

  if (config.aggregateMapUrl && external) {
    external.href = config.aggregateMapUrl;
    external.hidden = false;
  }

  if (config.enabled === false) {
    mapCard.hidden = true;
    return;
  }

  const endpoint = config.endpoint || 'https://ipwho.is/';
  const placeDot = (latitude, longitude) => {
    const lat = Math.max(-85, Math.min(85, Number(latitude)));
    const lon = Math.max(-180, Math.min(180, Number(longitude)));
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return false;
    const x = ((lon + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    dot.style.left = `${x}%`;
    dot.style.top = `${y}%`;
    dot.classList.add('show');
    return true;
  };

  fetch(endpoint, { cache: 'no-store' })
    .then((response) => response.ok ? response.json() : Promise.reject(new Error('IP lookup failed')))
    .then((data) => {
      const ok = data && data.success !== false;
      if (!ok) throw new Error(data && data.message ? data.message : 'IP lookup failed');
      const city = data.city || data.region || '';
      const country = data.country || '';
      const ip = data.ip ? ` · ${data.ip}` : '';
      const mapped = placeDot(data.latitude, data.longitude);
      setStatus(mapped ? '已定位' : '已连接');
      setLocation([city, country].filter(Boolean).join('，') + ip || '已获取访问来源，但未返回可定位坐标。');
    })
    .catch(() => {
      setStatus('待部署');
      setLocation('IP 地图需要联网部署后加载；本地预览或浏览器隐私策略可能阻止定位请求。');
    });
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
