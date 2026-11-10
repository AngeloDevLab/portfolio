const MIN_CARDS = 5;
const SWIPE_THRESHOLD = 50;

/**
 * Clones the card set until there are enough cards to show a neighbor on both sides at all times.
 * @param list - List that holds the reference cards.
 * @returns All cards including the clones, in display order.
 */
function fillCards(list: HTMLElement): HTMLElement[] {
  const originals = [...list.children] as HTMLElement[];
  const cards = [...originals];
  while (cards.length < MIN_CARDS) {
    originals.forEach((card) => {
      const clone = card.cloneNode(true) as HTMLElement;
      list.append(clone);
      cards.push(clone);
    });
  }
  return cards;
}

/**
 * Clones the template dot so there is one dot per reference, each labeled with its number.
 * @param template - Dot button from the markup, used for the first reference.
 * @param count - Number of references.
 * @returns All dot buttons in order.
 */
function createDots(template: HTMLElement, count: number): HTMLElement[] {
  const label = template.getAttribute('aria-label');
  const dots = [template];
  while (dots.length < count) {
    const clone = template.cloneNode(true) as HTMLElement;
    template.parentElement!.append(clone);
    dots.push(clone);
  }
  dots.forEach((dot, index) => dot.setAttribute('aria-label', `${label} ${index + 1}`));
  return dots;
}

/**
 * Returns the shortest signed distance from the active index, wrapping around the end.
 * @param index - Index to measure.
 * @param current - Active index.
 * @param total - Number of items in the loop.
 * @returns Negative for items on the left, positive for items on the right.
 */
function getOffset(index: number, current: number, total: number): number {
  const distance = (index - current + total) % total;
  return distance > total / 2 ? distance - total : distance;
}

/**
 * Positions every card relative to the active one and marks its role for styling.
 * @param cards - All cards including clones.
 * @param current - Index of the active card.
 */
function renderCards(cards: HTMLElement[], current: number) {
  cards.forEach((card, index) => {
    const offset = getOffset(index, current, cards.length);
    card.style.setProperty('--offset', String(offset));
    card.classList.toggle('references__card--active', offset === 0);
    card.classList.toggle('references__card--prev', offset === -1);
    card.classList.toggle('references__card--next', offset === 1);
    card.classList.toggle('references__card--hidden', Math.abs(offset) > 1);
    card.setAttribute('aria-hidden', String(offset !== 0));
  });
}

/**
 * Highlights the dot of the active reference.
 * @param dots - Dot buttons, one per original card.
 * @param active - Index of the active original card.
 */
function renderDots(dots: HTMLElement[], active: number) {
  dots.forEach((dot, index) => {
    dot.classList.toggle('references__dot--active', index === active);
    dot.toggleAttribute('aria-current', index === active);
  });
}

/**
 * Calls back with the direction of a horizontal swipe on the element.
 * @param element - Element that receives the swipe.
 * @param onSwipe - Gets 1 for a swipe to the left (next) and -1 for a swipe to the right (previous).
 */
function listenForSwipe(element: HTMLElement, onSwipe: (direction: number) => void) {
  let startX = 0;
  element.addEventListener('pointerdown', (event) => (startX = event.clientX));
  element.addEventListener('pointerup', (event) => {
    const deltaX = event.clientX - startX;
    if (Math.abs(deltaX) > SWIPE_THRESHOLD) onSwipe(deltaX < 0 ? 1 : -1);
  });
}

/**
 * Turns the reference list into an endless carousel with arrows, dots and swipe.
 */
export function initReferences() {
  const section = document.querySelector<HTMLElement>('.references')!;
  const list = section.querySelector<HTMLElement>('.references__cards')!;
  const count = list.children.length;
  const cards = fillCards(list);
  const dots = createDots(section.querySelector<HTMLElement>('.references__dot')!, count);
  let current = 0;
  const goTo = (index: number) => {
    current = (index + cards.length) % cards.length;
    renderCards(cards, current);
    renderDots(dots, current % count);
  };
  section.querySelector('.references__arrow--prev')!.addEventListener('click', () => goTo(current - 1));
  section.querySelector('.references__arrow--next')!.addEventListener('click', () => goTo(current + 1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => goTo(current + getOffset(index, current % count, count))));
  listenForSwipe(list, (direction) => goTo(current + direction));
  goTo(0);
}
