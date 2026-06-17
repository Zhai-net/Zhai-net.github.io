const publications = Array.isArray(window.ZHAI_PUBLICATIONS) ? window.ZHAI_PUBLICATIONS : [];
const people = Array.isArray(window.ZHAI_PEOPLE) ? window.ZHAI_PEOPLE : [];
const gallery = Array.isArray(window.ZHAI_GALLERY) ? window.ZHAI_GALLERY : [];
const news = Array.isArray(window.ZHAI_NEWS) ? window.ZHAI_NEWS : [];
const site = window.ZHAI_SITE && typeof window.ZHAI_SITE === 'object' ? window.ZHAI_SITE : {};
const PORTRAIT_PLACEHOLDER = 'assets/portraits/portrait-placeholder.jpg';

const escapeHTML = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const lineBreaks = (value) => escapeHTML(value).replace(/\n/g, '<br>');
const pad2 = (value) => String(value).padStart(2, '0');
const publicationSearchText = (publication) => [
  publication.title,
  publication.authors,
  publication.journal,
  publication.year,
  publication.detail,
  publication.doi
].filter(Boolean).join(' ');

function safeUrl(value, fallback = '#') {
  const url = String(value || '').trim();
  if (!url) return fallback;
  if (/^(https?:|mailto:)/i.test(url) || /^(?:\.\/|\.\.\/|\/)?[\w.-]+(?:\/|$)/.test(url)) return escapeHTML(url);
  return fallback;
}

function imageMarkup({ src, alt, className = '', lightbox = true }) {
  const classes = className ? ` class="${escapeHTML(className)}"` : '';
  const lightboxAttribute = lightbox ? ' data-lightbox' : '';
  return `<img${classes}${lightboxAttribute} src="${safeUrl(src, PORTRAIT_PLACEHOLDER)}" alt="${escapeHTML(alt)}" loading="lazy" decoding="async" fetchpriority="low">`;
}
