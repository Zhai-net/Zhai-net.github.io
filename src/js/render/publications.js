function renderFeaturedPublications() {
  const target = document.querySelector('[data-featured-publications]');
  if (!target) return;
  const featured = publications.filter((publication) => publication.featured).slice(0, 4);
  const selected = featured.length ? featured : publications.slice(0, 4);

  target.innerHTML = selected.map((publication, index) => `
    <article class="publication-item reveal">
      <span class="pub-index">${pad2(index + 1)}</span>
      <div>
        <h3>${escapeHTML(publication.title)}</h3>
        <p>${escapeHTML(publication.journal)}, ${escapeHTML(publication.year)}, ${escapeHTML(publication.detail || '')}</p>
      </div>
      <time datetime="${escapeHTML(publication.year)}">${escapeHTML(publication.year)}</time>
    </article>
  `).join('');
}

function renderPublicationPage() {
  const target = document.querySelector('[data-publications-render-target]');
  if (!target) return;

  const sorted = publications
    .map((publication, sourceIndex) => ({ publication, sourceIndex }))
    .sort((first, second) => Number(second.publication.year) - Number(first.publication.year) || first.sourceIndex - second.sourceIndex)
    .map(({ publication }) => publication);
  const years = [...new Set(sorted.map((publication) => publication.year))]
    .sort((first, second) => Number(second) - Number(first));

  const yearIndex = document.querySelector('[data-publication-year-index]');
  if (yearIndex) {
    yearIndex.innerHTML = years
      .map((year) => `<a href="#y${escapeHTML(year)}" data-year-jump="${escapeHTML(year)}">${escapeHTML(year)}</a>`)
      .join('');
  }
  document.querySelectorAll('[data-publication-total], [data-publication-count]')
    .forEach((node) => { node.textContent = String(publications.length); });

  let publicationIndex = 1;
  target.innerHTML = years.map((year) => {
    const items = sorted.filter((publication) => String(publication.year) === String(year));
    const cards = items.map((publication) => {
      const index = publicationIndex;
      publicationIndex += 1;
      const doi = publication.doi || '';
      const doiUrl = publication.doiUrl || (doi ? `https://doi.org/${doi}` : '');
      return `
        <article class="publication-card compact" data-pub-card data-year="${escapeHTML(publication.year)}" data-search="${escapeHTML(publicationSearchText(publication))}">
          <div class="year">${pad2(index)}</div>
          <div>
            <h3>${escapeHTML(publication.title)}</h3>
            <p class="publication-meta-line">${escapeHTML(publication.authors)}. <em>${escapeHTML(publication.journal)}</em> ${escapeHTML(publication.detail || '')} (${escapeHTML(publication.year)}).</p>
            <div class="publication-actions">
              ${doiUrl
                ? `<a class="doi-button" href="${safeUrl(doiUrl)}" target="_blank" rel="noopener noreferrer">DOI: ${escapeHTML(doi)}</a>`
                : '<span class="doi-button muted">DOI 待补充</span>'}
            </div>
          </div>
        </article>
      `;
    }).join('');

    return `
      <section class="publication-year-group reveal" id="y${escapeHTML(year)}" data-year-group="${escapeHTML(year)}" aria-labelledby="y${escapeHTML(year)}-title">
        <h2 class="publication-year-title" id="y${escapeHTML(year)}-title">${escapeHTML(year)}</h2>
        ${cards}
      </section>
    `;
  }).join('');
}
