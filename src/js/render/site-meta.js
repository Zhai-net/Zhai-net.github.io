function renderSiteMeta() {
  if (site.lastUpdated) {
    document.querySelectorAll('[data-last-updated]')
      .forEach((node) => { node.textContent = site.lastUpdated; });
  }
}
