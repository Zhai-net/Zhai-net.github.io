const CARD_INTERACTIVE_SELECTOR = 'a, button, [role="button"], input, select, textarea, [tabindex]';

function setPersonCardFlipped(card, flipped, moveFocus = false) {
  card.classList.toggle('is-flipped', flipped);
  queryAll('[data-person-card-toggle]', card).forEach((button) => {
    button.setAttribute('aria-expanded', String(flipped));
  });

  const front = query('.person-face.front', card);
  const back = query('.person-face.back', card);
  queryAll(CARD_INTERACTIVE_SELECTOR, front || document.createElement('div'))
    .forEach((node) => { node.tabIndex = flipped ? -1 : 0; });
  queryAll(CARD_INTERACTIVE_SELECTOR, back || document.createElement('div'))
    .forEach((node) => { node.tabIndex = flipped ? 0 : -1; });

  if (!moveFocus) return;
  const target = flipped
    ? query('.person-card-return', card)
    : query('.person-face.front .person-card-toggle', card);
  target?.focus();
}

function preparePersonCards() {
  queryAll('.person-card').forEach((card) => {
    if (card.dataset.cardPrepared === 'true') return;
    card.dataset.cardPrepared = 'true';
    setPersonCardFlipped(card, false);
  });
}

function initPersonCards() {
  if (document.documentElement.dataset.personCardsInitialized === 'true') return;
  document.documentElement.dataset.personCardsInitialized = 'true';

  document.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-person-card-toggle]');
    if (toggle) {
      event.stopPropagation();
      const card = toggle.closest('.person-card');
      if (card) setPersonCardFlipped(card, !card.classList.contains('is-flipped'), true);
      return;
    }

    queryAll('.person-card.is-flipped').forEach((card) => {
      if (!card.contains(event.target)) setPersonCardFlipped(card, false);
    });
  });
}
