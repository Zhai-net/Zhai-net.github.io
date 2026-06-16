// Data-driven rendering layer: keep page presentation in HTML/CSS and editable content in assets/data/*.js.
(() => {
  const publications = Array.isArray(window.ZHAI_PUBLICATIONS) ? window.ZHAI_PUBLICATIONS : [];
  const people = Array.isArray(window.ZHAI_PEOPLE) ? window.ZHAI_PEOPLE : [];
  const gallery = Array.isArray(window.ZHAI_GALLERY) ? window.ZHAI_GALLERY : [];
  const news = Array.isArray(window.ZHAI_NEWS) ? window.ZHAI_NEWS : [];
  const site = window.ZHAI_SITE || {};

  const escapeHTML = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const nl2br = (value) => escapeHTML(value).replace(/\n/g, '<br/>');
  const two = (n) => String(n).padStart(2, '0');
  const pubDetail = (pub) => [pub.journal, pub.detail].filter(Boolean).join(' ');
  const pubSearchText = (pub) => [pub.title, pub.authors, pub.journal, pub.year, pub.detail, pub.doi].filter(Boolean).join(' ');

  function renderPiFeature() {
    const target = document.querySelector('[data-pi-feature]');
    if (!target) return;
    const pi = people.find((item) => item.category === 'pi') || people[0];
    if (!pi) return;
    target.innerHTML = `
      <div class="pi-card-top">
        <img alt="${escapeHTML(pi.imageAlt || `${pi.name}照片`)}" class="pi-photo" data-lightbox="" src="${escapeHTML(pi.image || 'assets/portraits/portrait-placeholder.jpg')}"/>
        <div class="pi-title-block">
          <p class="eyebrow">Principal Investigator</p>
          <h2>${escapeHTML(pi.name)} <span>${escapeHTML((pi.title || '').split('/')[0].trim() || '教授')}</span></h2>
          <p>${escapeHTML(pi.profile || pi.title || '')}</p>
        </div>
      </div>
      <dl class="profile-list">
        <div><dt>研究方向</dt><dd>${escapeHTML(pi.research || pi.shortBio || pi.bio || '')}</dd></div>
        <div><dt>所属单位</dt><dd>${nl2br(pi.unit || '中国科学技术大学\n工程科学学院近代力学系')}</dd></div>
        <div><dt>联系方式</dt><dd>${pi.email ? `<a href="mailto:${escapeHTML(pi.email)}">${escapeHTML(pi.email)}</a>` : '联系方式待补充'}</dd></div>
      </dl>
      <a class="more-link" href="people.html">了解课题组 <span>&rarr;</span></a>
    `;
  }

  function renderPersonCard(person, options = {}) {
    const isPi = person.category === 'pi';
    const cardClass = ['person-card', isPi ? 'person-pi' : '', 'reveal'].filter(Boolean).join(' ');
    const contact = person.email
      ? `<a class="mail" href="mailto:${escapeHTML(person.email)}">${escapeHTML(person.email)}</a>`
      : '<span class="mail">联系方式待补充</span>';
    return `
      <article class="${cardClass}"${person.id ? ` data-person-id="${escapeHTML(person.id)}"` : ''}>
        <div class="person-card-inner">
          <div class="person-face front">
            <img alt="${escapeHTML(person.imageAlt || `${person.name}照片`)}" data-lightbox="" src="${escapeHTML(person.image || 'assets/portraits/portrait-placeholder.jpg')}"/>
            <h3>${escapeHTML(person.name)}</h3>
            <p>${escapeHTML(person.title || '')}</p>
            <span class="role">${escapeHTML(person.role || '')}</span>
          </div>
          <div class="person-face back">
            <h3>${escapeHTML(person.name)}</h3>
            <p class="bio">${escapeHTML(options.short ? (person.shortBio || person.bio) : person.bio)}</p>
            ${contact}
          </div>
        </div>
      </article>
    `;
  }

  function renderAlumniCard(person) {
    const graduation = person.graduation || person.title || '毕业生';
    const destination = person.destination || person.bio || '信息待补充';
    return `
      <article class="alumni-card reveal"${person.id ? ` data-person-id="${escapeHTML(person.id)}"` : ''}>
        <div class="alumni-avatar-wrap">
          <img alt="${escapeHTML(person.imageAlt || `${person.name}照片`)}" data-lightbox="" src="${escapeHTML(person.image || 'assets/portraits/portrait-placeholder.jpg')}"/>
        </div>
        <div class="alumni-info">
          <h3>${escapeHTML(person.name)}</h3>
          <p>${escapeHTML(graduation)}</p>
          <span>${escapeHTML(destination)}</span>
        </div>
      </article>
    `;
  }

  function renderEmptyCard(message) {
    return `<article class="empty-card reveal"><p>${escapeHTML(message)}</p></article>`;
  }

  function renderHomePeople() {
    const target = document.querySelector('[data-people-home-grid]');
    if (!target) return;
    const selected = people.filter((person) => person.category !== 'alumni' && person.homepage !== false).slice(0, 12);
    target.innerHTML = selected.map((person) => renderPersonCard(person, { short: true })).join('');
  }

  function renderAlumniPlaceholderCard(index) {
    return `
      <article class="alumni-card alumni-placeholder reveal" aria-label="毕业生信息待补充 ${index}">
        <div class="alumni-avatar-wrap">
          <img alt="毕业生照片占位" src="assets/portraits/portrait-placeholder.jpg"/>
        </div>
        <div class="alumni-info">
          <h3>信息待补充</h3>
          <p>毕业年份待补充</p>
          <span>毕业去向待补充</span>
        </div>
      </article>
    `;
  }

  function renderHomeAlumni() {
    const target = document.querySelector('[data-alumni-home-grid]');
    if (!target) return;
    const alumni = people.filter((person) => person.category === 'alumni').slice(0, 14);
    if (!alumni.length) {
      target.innerHTML = renderEmptyCard('毕业生信息待课题组后续补充。');
      return;
    }
    const cards = alumni.map(renderAlumniCard);
    while (cards.length < 14) {
      cards.push(renderAlumniPlaceholderCard(cards.length + 1));
    }
    target.innerHTML = cards.join('');
  }

  function renderPeopleDirectory() {
    const target = document.querySelector('[data-people-directory]');
    if (!target) return;
    const sections = [
      { title: '课题组负责人', id: 'all-members', items: people.filter((p) => p.category === 'pi'), grid: 'people-directory-grid', empty: '负责人信息待补充。', always: true },
      { title: '博士后', id: 'postdocs', items: people.filter((p) => p.category === 'postdoc'), grid: 'people-directory-grid' },
      { title: '学生', id: 'students', items: people.filter((p) => p.category === 'student'), grid: 'people-directory-grid', empty: '学生信息待课题组后续补充。', always: true },
      { title: '毕业生 Alumni', id: 'alumni', items: people.filter((p) => p.category === 'alumni'), grid: 'alumni-grid', alumni: true, empty: '毕业生信息待课题组后续补充。', always: true }
    ];
    target.innerHTML = sections
      .filter((section) => section.items.length || section.always)
      .map((section) => `
        <h2 class="directory-heading reveal" id="${escapeHTML(section.id)}">${escapeHTML(section.title)}</h2>
        <div class="${escapeHTML(section.grid)}">
          ${section.items.length
            ? section.items.map((person) => section.alumni ? renderAlumniCard(person) : renderPersonCard(person)).join('')
            : renderEmptyCard(section.empty || '信息待补充。')}
        </div>
      `).join('');
  }

  function renderGallery() {
    const target = document.querySelector('[data-gallery-grid]');
    if (!target) return;
    target.innerHTML = gallery.map((item) => `
      <figure class="gallery-card reveal">
        <img alt="${escapeHTML(item.alt || item.title)}" data-lightbox="" src="${escapeHTML(item.image)}"/>
        <figcaption><strong>${escapeHTML(item.title)}</strong><span>${escapeHTML(item.description || '')}</span></figcaption>
      </figure>
    `).join('');
  }

  function renderNews(targetSelector, limit) {
    const target = document.querySelector(targetSelector);
    if (!target) return;
    const list = typeof limit === 'number' ? news.slice(0, limit) : news;
    target.innerHTML = list.map((item) => `
      <article class="timeline-item reveal">
        <time class="timeline-date">${escapeHTML(item.date)}</time>
        <div class="timeline-card"><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.description)}</p></div>
      </article>
    `).join('');
  }

  function renderFeaturedPublications() {
    const target = document.querySelector('[data-featured-publications]');
    if (!target) return;
    const selected = publications.filter((pub) => pub.featured).slice(0, 4);
    const list = selected.length ? selected : publications.slice(0, 4);
    target.innerHTML = list.map((pub, index) => `
      <article class="publication-item reveal">
        <span class="pub-index">${two(index + 1)}</span>
        <div><h3>${escapeHTML(pub.title)}</h3><p>${escapeHTML(pub.journal)}, ${escapeHTML(pub.year)}, ${escapeHTML(pub.detail || '')}</p></div>
        <time>${escapeHTML(pub.year)}</time>
      </article>
    `).join('');
  }

  function renderPublicationPage() {
    const target = document.querySelector('[data-publications-render-target]');
    if (!target) return;
    const sorted = publications.slice().sort((a, b) => Number(b.year) - Number(a.year) || publications.indexOf(a) - publications.indexOf(b));
    const years = [...new Set(sorted.map((pub) => pub.year))].sort((a, b) => Number(b) - Number(a));
    const indexTarget = document.querySelector('[data-publication-year-index]');
    if (indexTarget) {
      indexTarget.innerHTML = years.map((year) => `<a href="#y${escapeHTML(year)}" data-year-jump="${escapeHTML(year)}">${escapeHTML(year)}</a>`).join('');
    }
    const totalTarget = document.querySelector('[data-publication-total]');
    if (totalTarget) totalTarget.textContent = String(publications.length);
    const countTarget = document.querySelector('[data-publication-count]');
    if (countTarget) countTarget.textContent = String(publications.length);
    let counter = 1;
    target.innerHTML = years.map((year) => {
      const items = sorted.filter((pub) => String(pub.year) === String(year));
      return `
        <section class="publication-year-group reveal" id="y${escapeHTML(year)}" data-year-group="${escapeHTML(year)}">
          <h2 class="publication-year-title">${escapeHTML(year)}</h2>
          ${items.map((pub) => {
            const idx = counter++;
            const doi = pub.doi || '';
            const doiUrl = pub.doiUrl || (doi ? `https://doi.org/${doi}` : '');
            return `
              <article class="publication-card compact" data-pub-card="" data-year="${escapeHTML(pub.year)}" data-search="${escapeHTML(pubSearchText(pub))}">
                <div class="year">${two(idx)}</div>
                <div>
                  <h3>${escapeHTML(pub.title)}</h3>
                  <p class="publication-meta-line">${escapeHTML(pub.authors)}. ${escapeHTML(pub.title)}. <em>${escapeHTML(pub.journal)}</em> ${escapeHTML(pub.detail || '')} (${escapeHTML(pub.year)}).</p>
                  <div class="publication-actions">
                    ${doiUrl ? `<a class="doi-button" href="${escapeHTML(doiUrl)}" rel="noopener" target="_blank">DOI: ${escapeHTML(doi)}</a>` : '<span class="doi-button muted">DOI 待补充</span>'}
                  </div>
                </div>
              </article>
            `;
          }).join('')}
        </section>
      `;
    }).join('');
  }

  function renderSiteMeta() {
    if (site.lastUpdated) {
      document.querySelectorAll('[data-last-updated]').forEach((node) => { node.textContent = site.lastUpdated; });
    }
  }

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
})();
