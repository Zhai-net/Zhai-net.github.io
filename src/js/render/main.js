function renderPageContent() {
  renderPiFeature();
  renderHomePeople();
  renderHomeAlumni();
  renderPeopleDirectory();
  renderGallery();
  renderNews('[data-news-home-timeline]', 3);
  renderNews('[data-news-page-timeline]');
  renderFeaturedPublications();
  renderPublicationPage();
  renderSiteMeta();
  document.dispatchEvent(new CustomEvent('zhai:content-rendered'));
}

renderPageContent();
