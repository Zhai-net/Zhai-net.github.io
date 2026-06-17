/**
 * Shared browser utilities used by the rendering and interaction layers.
 * Keep this file dependency-free so the site remains deployable as plain static files.
 */
(() => {
  "use strict";

  const query = (selector, scope = document) => scope.querySelector(selector);
  const queryAll = (selector, scope = document) =>
    Array.from(scope.querySelectorAll(selector));
  const escapeHTML = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  const normalizeText = (value) =>
    String(value ?? "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u2010-\u2015]/g, "-")
      .replace(/\s+/g, " ")
      .trim();
  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const getConnection = () =>
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;
  const isLowPowerDevice = (memoryLimit = 4) => {
    const connection = getConnection();
    return Boolean(
      (connection && connection.saveData) ||
      (navigator.deviceMemory && navigator.deviceMemory <= memoryLimit),
    );
  };

  window.ZHAI_UTILS = Object.freeze({
    escapeHTML,
    isLowPowerDevice,
    normalizeText,
    prefersReducedMotion,
    query,
    queryAll,
  });
})();
