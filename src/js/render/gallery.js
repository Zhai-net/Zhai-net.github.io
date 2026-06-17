function renderGallery() {
  const target = document.querySelector('[data-gallery-grid]');
  if (!target) return;
  target.innerHTML = gallery.map((item) => `
    <figure class="gallery-card reveal">
      ${imageMarkup({ src: item.image, alt: item.alt || item.title })}
      <figcaption>
        <strong>${escapeHTML(item.title)}</strong>
        <span>${escapeHTML(item.description || '')}</span>
      </figcaption>
    </figure>
  `).join('');
}
