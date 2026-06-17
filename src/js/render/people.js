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
