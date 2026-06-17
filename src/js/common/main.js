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
