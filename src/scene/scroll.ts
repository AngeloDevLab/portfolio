import { MathUtils } from 'three';

const LOOP_MARGIN = 2;
let smoothScrollY = 0;

/**
 * Returns the maximum scroll distance of the page in pixels.
 * @returns Scrollable height in pixels.
 */
function getMaxScroll() {
  return document.documentElement.scrollHeight - window.innerHeight;
}

/**
 * Wraps a scroll position into the range of one page loop.
 * @param scrollY - Scroll position in pixels, may be negative or beyond the page end.
 * @returns Scroll position between 0 and the maximum scroll distance.
 */
function wrapScrollY(scrollY: number) {
  const maxScroll = getMaxScroll();
  return ((scrollY % maxScroll) + maxScroll) % maxScroll;
}

/**
 * Returns the progress of an element passing through the screen: 0.5 when its center is at the screen center, 0 one screen earlier, 1 one screen later.
 * @param element - Element to measure against.
 * @returns Element progress between 0 and 1.
 */
function getElementProgress(element: HTMLElement) {
  const screenHeight = window.innerHeight;
  const centeredAt = element.offsetTop + element.offsetHeight / 2 - screenHeight / 2;
  const distance = wrapScrollY(smoothScrollY) - centeredAt;
  return MathUtils.clamp((distance + screenHeight) / (2 * screenHeight), 0, 1);
}

/**
 * Returns the bottom edge of the first element that is currently inside the viewport.
 * @param elements - Elements to check.
 * @returns Bottom edge in pixels, or null if none of them is visible.
 */
export function getVisibleBottom(elements: NodeListOf<HTMLElement>) {
  for (const element of elements) {
    const { top, bottom } = element.getBoundingClientRect();
    if (bottom > 0 && top < window.innerHeight) return bottom;
  }
  return null;
}

/**
 * Jumps the page to the given position and shifts the smoothed position by the same distance.
 * @param targetY - Scroll position to jump to in pixels.
 */
function jumpTo(targetY: number) {
  smoothScrollY += targetY - window.scrollY;
  window.scrollTo({ top: targetY, behavior: 'instant' });
}

/**
 * Moves the page slightly off the very top, so scrolling up can trigger the loop as well.
 */
export function initScrollLoop() {
  if (window.scrollY < LOOP_MARGIN) {
    window.scrollTo({ top: LOOP_MARGIN, behavior: 'instant' });
  }
  smoothScrollY = window.scrollY;
}

/**
 * Loops the page in both directions: past the bottom continues at the top, past the top continues at the bottom.
 */
export function loopScroll() {
  const maxScroll = getMaxScroll();
  if (window.scrollY >= maxScroll - 1) {
    jumpTo(LOOP_MARGIN);
  } else if (window.scrollY <= 0) {
    jumpTo(maxScroll - LOOP_MARGIN);
  }
}

/**
 * Moves clicks in the hero copy to the same spot in the real hero, so its links scroll the short way.
 * @param heroCopy - Hero copy at the end of the page.
 */
export function jumpToHeroOnClick(heroCopy: HTMLElement) {
  heroCopy.addEventListener('click', () => {
    const targetY = window.scrollY - heroCopy.offsetTop;
    if (targetY >= 0) jumpTo(Math.max(targetY, LOOP_MARGIN));
  });
}

/**
 * Stops mouse clicks from focusing elements in the hero copy, as it is hidden from assistive technology.
 * @param heroCopy - Hero copy at the end of the page.
 */
export function keepFocusOutOfHeroCopy(heroCopy: HTMLElement) {
  heroCopy.addEventListener('mousedown', (event) => event.preventDefault());
}

/**
 * Moves the smoothed scroll position a bit closer to the real one.
 * @param deltaSeconds - Time since the last frame in seconds.
 * @param element - Element the progress is measured against.
 * @returns Element progress between 0 and 1.
 */
export function updateSmoothProgress(deltaSeconds: number, element: HTMLElement) {
  const factor = 1 - Math.exp(-8 * deltaSeconds);
  smoothScrollY += (window.scrollY - smoothScrollY) * factor;
  return getElementProgress(element);
}
