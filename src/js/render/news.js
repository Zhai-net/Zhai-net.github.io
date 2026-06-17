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
