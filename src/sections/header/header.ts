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
 * Checks whether the header still sits in its spot at the top of the page.
 * @param header - Page header.
 * @param hero - Hero section, if the page has one.
 * @returns True until the header has been scrolled out of view.
 */
function isAtTop(header: HTMLElement, hero?: HTMLElement) {
  const top = hero ? hero.getBoundingClientRect().top : -window.scrollY;
  return top > -header.offsetHeight;
}

/**
 * Hides the fixed header while scrolling down or while the hero is visible, and shows it again while scrolling up.
 * @param header - Page header.
 * @param hero - Hero section, if the page has one.
 */
function updateHeader(header: HTMLElement, hero?: HTMLElement) {
  const delta = window.scrollY - lastScrollY;
  lastScrollY = window.scrollY;
  const atTop = isAtTop(header, hero);
  setFixed(header, !atTop);
  if (atTop) return;
  if (hero && isInViewport(hero)) {
    scrollDelta = 0;
    header.classList.add('header--hidden');
    return;
  }
  const sum = sumScrollDelta(delta);
  if (Math.abs(sum) > SCROLL_THRESHOLD) header.classList.toggle('header--hidden', sum > 0);
}

/**
 * Scrolls back to the top instead of following the "#" link of the logo, so a click at the top does nothing.
 * @param event - Click event of the logo.
 */
function scrollToTop(event: Event) {
  event.preventDefault();
  if (window.scrollY > 0) window.scrollTo({ top: 0 });
}

/**
 * Makes the header a fixed bar below the hero, or below the page top without a hero, that hides while scrolling down and returns while scrolling up.
 * @param hero - Hero section, if the page has one.
 */
export function initHeader(hero?: HTMLElement) {
  const header = document.querySelector<HTMLElement>('.header')!;
  lastScrollY = window.scrollY;
  header.addEventListener('focusin', () => header.classList.remove('header--hidden'));
  header.querySelector('.logo[href="#"]')?.addEventListener('click', scrollToTop);
  window.addEventListener('scroll', () => updateHeader(header, hero), { passive: true });
  updateHeader(header, hero);
}
