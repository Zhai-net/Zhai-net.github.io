// GENERATED FILE. Edit src/js/render/*.js and run npm run build.

(() => {
  'use strict';

  // Source: src/js/render/utils.js
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
  
  // Source: src/js/render/people.js
  function renderPiFeature() {
    const target = document.querySelector('[data-pi-feature]');
    if (!target) return;
    const principalInvestigator = people.find((person) => person.category === 'pi') || people[0];
    if (!principalInvestigator) return;
  
    const title = (principalInvestigator.title || '').split('/')[0].trim() || '教授';
    const email = principalInvestigator.email
      ? `<a href="mailto:${escapeHTML(principalInvestigator.email)}">${escapeHTML(principalInvestigator.email)}</a>`
      : '联系方式待补充';
  
    target.innerHTML = `
      <div class="pi-card-top">
        ${imageMarkup({
          src: principalInvestigator.image || PORTRAIT_PLACEHOLDER,
          alt: principalInvestigator.imageAlt || `${principalInvestigator.name}照片`,
          className: 'pi-photo'
        })}
        <div class="pi-title-block">
          <p class="eyebrow">Principal Investigator</p>
          <h2>${escapeHTML(principalInvestigator.name)} <span>${escapeHTML(title)}</span></h2>
          <p>${escapeHTML(principalInvestigator.profile || principalInvestigator.title || '')}</p>
        </div>
      </div>
      <dl class="profile-list">
        <div><dt>研究方向</dt><dd>${escapeHTML(principalInvestigator.research || principalInvestigator.shortBio || principalInvestigator.bio || '')}</dd></div>
        <div><dt>所属单位</dt><dd>${lineBreaks(principalInvestigator.unit || '中国科学技术大学\n工程科学学院近代力学系')}</dd></div>
        <div><dt>联系方式</dt><dd>${email}</dd></div>
      </dl>
      <a class="more-link" href="people.html">了解课题组 <span aria-hidden="true">→</span></a>
    `;
  }
  
  function renderPersonCard(person, { short = false } = {}) {
    const classNames = ['person-card', person.category === 'pi' ? 'person-pi' : '', 'reveal']
      .filter(Boolean)
      .join(' ');
    const personId = person.id ? ` data-person-id="${escapeHTML(person.id)}"` : '';
    const email = person.email
      ? `<a class="mail" href="mailto:${escapeHTML(person.email)}">${escapeHTML(person.email)}</a>`
      : '<span class="mail">联系方式待补充</span>';
    const biography = short ? (person.shortBio || person.bio) : person.bio;
  
    return `
      <article class="${classNames}"${personId}>
        <div class="person-card-inner">
          <div class="person-face front">
            <button class="person-card-toggle" type="button" data-person-card-toggle aria-expanded="false" aria-label="查看${escapeHTML(person.name)}的简介">i</button>
            ${imageMarkup({ src: person.image || PORTRAIT_PLACEHOLDER, alt: person.imageAlt || `${person.name}照片` })}
            <h3>${escapeHTML(person.name)}</h3>
            <p>${escapeHTML(person.title || '')}</p>
            <span class="role">${escapeHTML(person.role || '')}</span>
          </div>
          <div class="person-face back">
            <button class="person-card-toggle person-card-return" type="button" data-person-card-toggle aria-expanded="false" aria-label="返回${escapeHTML(person.name)}的名片正面">↩</button>
            <h3>${escapeHTML(person.name)}</h3>
            <p class="bio">${escapeHTML(biography || '')}</p>
            ${email}
          </div>
        </div>
      </article>
    `;
  }
  
  function renderAlumniCard(person) {
    const personId = person.id ? ` data-person-id="${escapeHTML(person.id)}"` : '';
    return `
      <article class="alumni-card reveal"${personId}>
        <div class="alumni-avatar-wrap">
          ${imageMarkup({ src: person.image || PORTRAIT_PLACEHOLDER, alt: person.imageAlt || `${person.name}照片` })}
        </div>
        <div class="alumni-info">
          <h3>${escapeHTML(person.name)}</h3>
          <p>${escapeHTML(person.graduation || person.title || '毕业生')}</p>
          <span>${escapeHTML(person.destination || person.bio || '信息待补充')}</span>
        </div>
      </article>
    `;
  }
  
  const renderEmptyCard = (message) => `<article class="empty-card reveal"><p>${escapeHTML(message)}</p></article>`;
  
  function renderHomePeople() {
    const target = document.querySelector('[data-people-home-grid]');
    if (!target) return;
    const selected = people
      .filter((person) => person.category !== 'alumni' && person.homepage !== false)
      .slice(0, 12);
    target.innerHTML = selected.map((person) => renderPersonCard(person, { short: true })).join('');
  }
  
  function renderHomeAlumni() {
    const target = document.querySelector('[data-alumni-home-grid]');
    if (!target) return;
    const alumni = people.filter((person) => person.category === 'alumni').slice(0, 14);
    target.innerHTML = alumni.length
      ? alumni.map(renderAlumniCard).join('')
      : renderEmptyCard('毕业生信息待课题组后续补充。');
  }
  
  function renderPeopleDirectory() {
    const target = document.querySelector('[data-people-directory]');
    if (!target) return;
  
    const sections = [
      { title: '课题组负责人', id: 'all-members', items: people.filter((person) => person.category === 'pi'), grid: 'people-directory-grid', empty: '负责人信息待补充。', always: true },
      { title: '博士后', id: 'postdocs', items: people.filter((person) => person.category === 'postdoc'), grid: 'people-directory-grid' },
      { title: '学生', id: 'students', items: people.filter((person) => person.category === 'student'), grid: 'people-directory-grid', empty: '学生信息待课题组后续补充。', always: true },
      { title: '毕业生 Alumni', id: 'alumni', items: people.filter((person) => person.category === 'alumni'), grid: 'alumni-grid', alumni: true, empty: '毕业生信息待课题组后续补充。', always: true }
    ];
  
    target.innerHTML = sections
      .filter((section) => section.items.length || section.always)
      .map((section) => `
        <section class="directory-group" aria-labelledby="${escapeHTML(section.id)}">
          <h2 class="directory-heading reveal" id="${escapeHTML(section.id)}">${escapeHTML(section.title)}</h2>
          <div class="${escapeHTML(section.grid)}">
            ${section.items.length
              ? section.items.map((person) => section.alumni ? renderAlumniCard(person) : renderPersonCard(person)).join('')
              : renderEmptyCard(section.empty || '信息待补充。')}
          </div>
        </section>
      `).join('');
  }
  
  // Source: src/js/render/gallery.js
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
  
  // Source: src/js/render/news.js
  function renderNews(targetSelector, limit) {
    const target = document.querySelector(targetSelector);
    if (!target) return;
    const items = typeof limit === 'number' ? news.slice(0, limit) : news;
    target.innerHTML = items.map((item) => {
      const datetime = String(item.date || '').replace(/\./g, '-');
      return `
        <article class="timeline-item reveal">
          <time class="timeline-date" datetime="${escapeHTML(datetime)}">${escapeHTML(item.date)}</time>
          <div class="timeline-card">
            <h3>${escapeHTML(item.title)}</h3>
            ${item.description ? `<p>${escapeHTML(item.description)}</p>` : ''}
          </div>
        </article>
      `;
    }).join('');
  }
  
  // Source: src/js/render/publications.js
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
  
  // Source: src/js/render/site-meta.js
  function renderSiteMeta() {
    if (site.lastUpdated) {
      document.querySelectorAll('[data-last-updated]')
        .forEach((node) => { node.textContent = site.lastUpdated; });
    }
  }
  
  // Source: src/js/render/main.js
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
})();
