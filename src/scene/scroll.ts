import { MathUtils } from 'three';

const LOOP_MARGIN = 2;
const TOP_RESISTANCE = 250;
const RESISTANCE_RESET_MS = 300;
let smoothScrollY = 0;
let topPull = 0;
let lastPullTime = 0;
let lastTouchY = 0;

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
export function getElementProgress(element: HTMLElement) {
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
 * Collects upward scrolling at the very top and jumps to the hero copy at the end once it passes the resistance.
 * Short or interrupted pulls start over, so a small slip does not leave the hero.
 * @param deltaY - Scroll distance of the gesture in pixels, negative when scrolling up.
 */
function pullPastTop(deltaY: number) {
  const now = performance.now();
  if (window.scrollY > 0 || deltaY >= 0 || now - lastPullTime > RESISTANCE_RESET_MS) topPull = 0;
  lastPullTime = now;
  if (window.scrollY > 0 || deltaY >= 0) return;
  topPull -= deltaY;
  if (topPull < TOP_RESISTANCE) return;
  topPull = 0;
  jumpTo(getMaxScroll() - LOOP_MARGIN);
}

/**
 * Feeds mouse wheel and touch gestures into the resistance at the top of the page.
 */
export function initScrollLoop() {
  smoothScrollY = window.scrollY;
  window.addEventListener('wheel', (event) => pullPastTop(event.deltaY * (event.deltaMode === 1 ? 16 : 1)), { passive: true });
  window.addEventListener('touchstart', (event) => (lastTouchY = event.touches[0].clientY), { passive: true });
  window.addEventListener('touchmove', (event) => {
    const touchY = event.touches[0].clientY;
    pullPastTop(lastTouchY - touchY);
    lastTouchY = touchY;
  }, { passive: true });
}

/**
 * Continues at the top once the page is scrolled past the bottom. Scrolling past the top is handled by the resistance.
 */
export function loopScroll() {
  if (window.scrollY >= getMaxScroll() - 1) jumpTo(LOOP_MARGIN);
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
