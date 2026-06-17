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
