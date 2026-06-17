function prepareEmailCopyButtons() {
  queryAll('.person-card a.mail[href^="mailto:"]').forEach((link) => {
    if (link.nextElementSibling?.classList.contains('copy-email')) return;
    const email = link.href.replace(/^mailto:/i, '').trim();
    const button = document.createElement('button');
    button.className = 'copy-email';
    button.type = 'button';
    button.dataset.copyEmail = email;
    button.textContent = '复制邮箱';
    button.setAttribute('aria-label', `复制邮箱 ${email}`);
    link.insertAdjacentElement('afterend', button);
  });
}

function initEmailCopy() {
  if (document.documentElement.dataset.emailCopyInitialized === 'true') return;
  document.documentElement.dataset.emailCopyInitialized = 'true';

  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-copy-email]');
    if (!button) return;
    const originalText = '复制邮箱';
    try {
      await copyText(button.dataset.copyEmail);
      button.textContent = '已复制';
      button.classList.add('copied');
    } catch (error) {
      button.textContent = '复制失败';
    }
    window.setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('copied');
    }, 1600);
  });
}
