import { isInViewport } from '../../scroll.ts';

const SCROLL_THRESHOLD = 15;

let lastScrollY = 0;
let scrollDelta = 0;

/**
 * Switches the header between its spot at the top of the hero and the fixed bar. The fixed bar starts hidden without sliding.
 * @param header - Page header.
 * @param fixed - True for the fixed bar.
 */
function setFixed(header: HTMLElement, fixed: boolean) {
  if (header.classList.contains('header--fixed') === fixed) return;
  if (!fixed) {
    header.classList.remove('header--fixed', 'header--hidden');
    return;
  }
  header.classList.add('header--instant', 'header--fixed', 'header--hidden');
  void header.offsetWidth;
  header.classList.remove('header--instant');
}

/**
 * Adds the scroll distance to the running sum, which starts over when the direction changes.
 * @param delta - Scroll distance since the last event in pixels.
 * @returns Summed distance in the current direction.
 */
function sumScrollDelta(delta: number) {
  scrollDelta = Math.sign(delta) === Math.sign(scrollDelta) ? scrollDelta + delta : delta;
  return scrollDelta;
}

/**
 * Hides the fixed header while scrolling down or while a hero is visible, and shows it again while scrolling up.
 * @param header - Page header.
 * @param heroes - Hero and its copy at the end of the page.
 */
function updateHeader(header: HTMLElement, heroes: NodeListOf<HTMLElement>) {
  const delta = window.scrollY - lastScrollY;
  lastScrollY = window.scrollY;
  const atTop = heroes[0].getBoundingClientRect().top > -header.offsetHeight;
  setFixed(header, !atTop);
  if (atTop) return;
  if ([...heroes].some(isInViewport) || Math.abs(delta) > window.innerHeight) {
    scrollDelta = 0;
    header.classList.add('header--hidden');
    return;
  }
  const sum = sumScrollDelta(delta);
  if (Math.abs(sum) > SCROLL_THRESHOLD) header.classList.toggle('header--hidden', sum > 0);
}

/**
 * Makes the header a fixed bar below the hero that hides while scrolling down and returns while scrolling up.
 * @param heroes - Hero and its copy at the end of the page.
 */
export function initHeader(heroes: NodeListOf<HTMLElement>) {
  const header = document.querySelector<HTMLElement>('.header')!;
  lastScrollY = window.scrollY;
  header.addEventListener('focusin', () => header.classList.remove('header--hidden'));
  window.addEventListener('scroll', () => updateHeader(header, heroes), { passive: true });
  updateHeader(header, heroes);
}
