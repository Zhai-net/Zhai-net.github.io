/**
 * Data-driven rendering layer.
 * Content is maintained in assets/data/*.js; this file only maps data to page markup.
 */
(() => {
  "use strict";

  const { escapeHTML, query, queryAll } = window.ZHAI_UTILS;
  const publications = Array.isArray(window.ZHAI_PUBLICATIONS)
    ? window.ZHAI_PUBLICATIONS
    : [];
  const people = Array.isArray(window.ZHAI_PEOPLE) ? window.ZHAI_PEOPLE : [];
  const gallery = Array.isArray(window.ZHAI_GALLERY) ? window.ZHAI_GALLERY : [];
  const news = Array.isArray(window.ZHAI_NEWS) ? window.ZHAI_NEWS : [];
  const site = window.ZHAI_SITE || {};

  const peopleByCategory = people.reduce((groups, person) => {
    const category = person.category || "other";
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(person);
    return groups;
  }, new Map());

  const getPeople = (category) => peopleByCategory.get(category) || [];
  const nl2br = (value) => escapeHTML(value).replace(/\n/g, "<br/>");
  const twoDigits = (number) => String(number).padStart(2, "0");
  const publicationSearchText = (publication) =>
    [
      publication.title,
      publication.authors,
      publication.journal,
      publication.year,
      publication.detail,
      publication.doi,
    ]
      .filter(Boolean)
      .join(" ");
  const setHTML = (selector, markup) => {
    const target = query(selector);
    if (target) target.innerHTML = markup;
    return target;
  };

  const renderPersonName = (person) => {
    const name = escapeHTML(person.name || "");
    const website = String(person.website || "").trim();

    if (!/^https?:\/\//i.test(website)) return name;

    return `<a class="person-name-link" href="${escapeHTML(website)}" rel="noopener noreferrer" target="_blank">${name}</a>`;
  };

  function renderPiFeature() {
    const target = query("[data-pi-feature]");
    if (!target) return;

    const pi = getPeople("pi")[0] || people[0];
    if (!pi) return;

    const image = pi.image || "assets/portraits/portrait-placeholder.jpg";
    const title = (pi.title || "").split("/")[0].trim() || "教授";
    const unit = pi.unit || "中国科学技术大学\n工程科学学院近代力学系";
    const contact = pi.email
      ? `<a href="mailto:${escapeHTML(pi.email)}">${escapeHTML(pi.email)}</a>`
      : "联系方式待补充";

    target.innerHTML = `
      <div class="pi-card-top">
        <img alt="${escapeHTML(pi.imageAlt || `${pi.name}照片`)}" class="pi-photo" data-lightbox="" decoding="async" fetchpriority="low" loading="lazy" src="${escapeHTML(image)}"/>
        <div class="pi-title-block">
          <p class="eyebrow">Principal Investigator</p>
          <h2>${escapeHTML(pi.name)} <span class="pi-role-title">${escapeHTML(title)}</span>${pi.nameEn ? `<span class="pi-name-en">${escapeHTML(pi.nameEn)}</span>` : ""}</h2>
          <p>${escapeHTML(pi.profile || pi.title || "")}</p>
        </div>
      </div>
      <dl class="profile-list">
        <div><dt>研究方向</dt><dd>${escapeHTML(pi.research || pi.shortBio || pi.bio || "")}</dd></div>
        <div><dt>所属单位</dt><dd>${nl2br(unit)}</dd></div>
        <div><dt>联系方式</dt><dd>${contact}</dd></div>
      </dl>
      <a class="more-link" href="people.html">了解课题组 <span>&rarr;</span></a>
    `;
  }

  function renderPersonCard(person, { short = false } = {}) {
    const cardClass = [
      "person-card",
      person.category === "pi" ? "person-pi" : "",
      "reveal",
    ]
      .filter(Boolean)
      .join(" ");
    const image = person.image || "assets/portraits/portrait-placeholder.jpg";
    const personId = person.id
      ? ` data-person-id="${escapeHTML(person.id)}"`
      : "";
    const englishName = person.nameEn
      ? `<span class="person-name-en">${escapeHTML(person.nameEn)}</span>`
      : '<span class="person-name-en" aria-hidden="true">&nbsp;</span>';
    const contact = person.email
      ? `<a class="mail" href="mailto:${escapeHTML(person.email)}">${escapeHTML(person.email)}</a>`
      : '<span class="mail">联系方式待补充</span>';
    const bio = short ? person.shortBio || person.bio : person.bio;

    return `
      <article class="${cardClass}"${personId}>
        <div class="person-card-inner">
          <div class="person-face front">
            <button aria-expanded="false" aria-label="查看${escapeHTML(person.name)}的简介" class="person-card-toggle" data-person-card-toggle type="button">i</button>
            <img alt="${escapeHTML(person.imageAlt || `${person.name}照片`)}" data-lightbox="" decoding="async" fetchpriority="low" loading="lazy" src="${escapeHTML(image)}"/>
            <h3>${escapeHTML(person.name)}</h3>
            ${englishName}
            <p>${escapeHTML(person.title || "")}</p>
            <span class="role">${escapeHTML(person.role || "")}</span>
          </div>
          <div class="person-face back">
            <button aria-expanded="false" aria-label="返回${escapeHTML(person.name)}的名片正面" class="person-card-toggle person-card-return" data-person-card-toggle type="button">↩</button>
            <h3>${escapeHTML(person.name)}</h3>
            <p class="bio">${escapeHTML(bio)}</p>
            ${contact}
          </div>
        </div>
      </article>
    `;
  }

  function renderAlumniCard(person) {
    const image = person.image || "assets/portraits/portrait-placeholder.jpg";
    const personId = person.id
      ? ` data-person-id="${escapeHTML(person.id)}"`
      : "";
    const englishName = person.nameEn
      ? `<span class="alumni-name-en">${escapeHTML(person.nameEn)}</span>`
      : "";

    return `
      <article class="alumni-card reveal"${personId}>
        <div class="alumni-avatar-wrap">
          <img alt="${escapeHTML(person.imageAlt || `${person.name}照片`)}" data-lightbox="" decoding="async" fetchpriority="low" loading="lazy" src="${escapeHTML(image)}"/>
        </div>
        <div class="alumni-info">
          <h3>${renderPersonName(person)}</h3>
          ${englishName}
          <p>${escapeHTML(person.graduation || person.title || "毕业生")}</p>
          <span>${escapeHTML(person.destination || person.bio || "信息待补充")}</span>
        </div>
      </article>
    `;
  }

  const renderEmptyCard = (message) =>
    `<article class="empty-card reveal"><p>${escapeHTML(message)}</p></article>`;

  function renderHomePeople() {
    const selected = people
      .filter(
        (person) => person.category !== "alumni" && person.homepage !== false,
      )
      .slice(0, 12);
    setHTML(
      "[data-people-home-grid]",
      selected
        .map((person) => renderPersonCard(person, { short: true }))
        .join(""),
    );
  }

  function renderHomeAlumni() {
    const target = query("[data-alumni-home-grid]");
    if (!target) return;

    const alumni = getPeople("alumni").slice(0, 14);
    target.innerHTML = alumni.length
      ? alumni.map(renderAlumniCard).join("")
      : renderEmptyCard("毕业生信息待课题组后续补充。");
  }

  function renderPeopleDirectory() {
    const target = query("[data-people-directory]");
    if (!target) return;

    const sections = [
      {
        title: "课题组负责人",
        id: "all-members",
        items: getPeople("pi"),
        grid: "people-directory-grid",
        empty: "负责人信息待补充。",
        always: true,
      },
      {
        title: "博士后",
        id: "postdocs",
        items: getPeople("postdoc"),
        grid: "people-directory-grid",
      },
      {
        title: "学生",
        id: "students",
        items: getPeople("student"),
        grid: "people-directory-grid",
        empty: "学生信息待课题组后续补充。",
        always: true,
      },
      {
        title: "毕业生 Alumni",
        id: "alumni",
        items: getPeople("alumni"),
        grid: "alumni-grid",
        alumni: true,
        empty: "毕业生信息待课题组后续补充。",
        always: true,
      },
    ];

    target.innerHTML = sections
      .filter(({ items, always }) => items.length || always)
      .map(({ title, id, items, grid, alumni, empty }) => {
        const cards = items.length
          ? items
              .map((person) =>
                alumni ? renderAlumniCard(person) : renderPersonCard(person),
              )
              .join("")
          : renderEmptyCard(empty || "信息待补充。");
        return `
          <h2 class="directory-heading reveal" id="${escapeHTML(id)}">${escapeHTML(title)}</h2>
          <div class="${escapeHTML(grid)}">${cards}</div>
        `;
      })
      .join("");
  }

  function renderGallery() {
    setHTML(
      "[data-gallery-grid]",
      gallery
        .map(
          (item) => `
            <figure class="gallery-card reveal">
              <img alt="${escapeHTML(item.alt || item.title)}" data-lightbox="" decoding="async" fetchpriority="low" loading="lazy" src="${escapeHTML(item.image)}"/>
              <figcaption><strong>${escapeHTML(item.title)}</strong><span>${escapeHTML(item.description || "")}</span></figcaption>
            </figure>
          `,
        )
        .join(""),
    );
  }

  function renderNews(selector, limit) {
    const list = typeof limit === "number" ? news.slice(0, limit) : news;
    setHTML(
      selector,
      list
        .map(
          (item) => `
            <article class="timeline-item reveal">
              <time class="timeline-date">${escapeHTML(item.date)}</time>
              <div class="timeline-card"><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.description)}</p></div>
            </article>
          `,
        )
        .join(""),
    );
  }

  function renderFeaturedPublications() {
    const featured = publications
      .filter(({ featured: isFeatured }) => isFeatured)
      .slice(0, 4);
    const list = featured.length ? featured : publications.slice(0, 4);

    setHTML(
      "[data-featured-publications]",
      list
        .map(
          (publication, index) => `
            <article class="publication-item reveal">
              <span class="pub-index">${twoDigits(index + 1)}</span>
              <div><h3>${escapeHTML(publication.title)}</h3><p>${escapeHTML(publication.journal)}, ${escapeHTML(publication.year)}, ${escapeHTML(publication.detail || "")}</p></div>
              <time>${escapeHTML(publication.year)}</time>
            </article>
          `,
        )
        .join(""),
    );
  }

  function groupPublicationsByYear() {
    const sorted = publications
      .map((publication, sourceIndex) => ({ publication, sourceIndex }))
      .sort(
        (a, b) =>
          Number(b.publication.year) - Number(a.publication.year) ||
          a.sourceIndex - b.sourceIndex,
      );

    return sorted.reduce((groups, { publication }) => {
      const year = String(publication.year);
      if (!groups.has(year)) groups.set(year, []);
      groups.get(year).push(publication);
      return groups;
    }, new Map());
  }

  function renderPublicationCard(publication, index) {
    const doi = publication.doi || "";
    const doiUrl = publication.doiUrl || (doi ? `https://doi.org/${doi}` : "");
    const action = doiUrl
      ? `<a class="doi-button" href="${escapeHTML(doiUrl)}" rel="noopener" target="_blank">DOI: ${escapeHTML(doi)}</a>`
      : '<span class="doi-button muted">DOI 待补充</span>';
    const detail = (publication.detail || "").trim();
    const metaParts = [`<em>${escapeHTML(publication.journal)}</em>`];

    if (detail) {
      metaParts.push(escapeHTML(detail));
    }

    metaParts.push(escapeHTML(publication.year));

    return `
      <article class="publication-card compact" data-pub-card="" data-year="${escapeHTML(publication.year)}" data-search="${escapeHTML(publicationSearchText(publication))}">
        <div class="publication-number" aria-label="第 ${index} 篇论文">
          <span class="publication-number-value">${index}</span>
        </div>
        <div class="publication-content">
          <h3>${escapeHTML(publication.title)}</h3>
          <p class="publication-authors">${escapeHTML(publication.authors)}</p>
          <p class="publication-meta-line">${metaParts.join('<span class="publication-meta-sep" aria-hidden="true">•</span>')}</p>
          <div class="publication-actions">${action}</div>
        </div>
      </article>
    `;
  }

  function renderPublicationPage() {
    const target = query("[data-publications-render-target]");
    if (!target) return;

    const groups = groupPublicationsByYear();
    const years = Array.from(groups.keys());
    let index = 0;

    setHTML(
      "[data-publication-year-index]",
      years
        .map(
          (year) =>
            `<a href="#y${escapeHTML(year)}" data-year-jump="${escapeHTML(year)}">${escapeHTML(year)}</a>`,
        )
        .join(""),
    );

    queryAll("[data-publication-total]").forEach(
      (node) => {
        node.textContent = String(publications.length);
      },
    );

    target.innerHTML = years
      .map((year) => {
        const cards = groups
          .get(year)
          .map((publication) =>
            renderPublicationCard(publication, (index += 1)),
          )
          .join("");
        return `
          <section class="publication-year-group reveal" id="y${escapeHTML(year)}" data-year-group="${escapeHTML(year)}">
            <h2 class="publication-year-title">${escapeHTML(year)}</h2>
            ${cards}
          </section>
        `;
      })
      .join("");
  }

  function renderSiteMeta() {
    if (!site.lastUpdated) return;
    queryAll("[data-last-updated]").forEach((node) => {
      node.textContent = site.lastUpdated;
    });
  }

  [
    renderPiFeature,
    renderHomePeople,
    renderHomeAlumni,
    renderPeopleDirectory,
    renderGallery,
    () => renderNews("[data-news-home-timeline]", 3),
    () => renderNews("[data-news-page-timeline]"),
    renderFeaturedPublications,
    renderPublicationPage,
    renderSiteMeta,
  ].forEach((render) => render());
})();
