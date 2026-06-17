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
