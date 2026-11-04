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
 * Returns the path progress: 0 to 0.5 while scrolling through the first screen, 0.5 to 1 through the last screen.
 * @returns Path progress between 0 and 1.
 */
function getPathProgress() {
  const screenHeight = window.innerHeight;
  const scrollY = wrapScrollY(smoothScrollY);
  const exit = MathUtils.clamp(scrollY / screenHeight, 0, 1);
  const enter = MathUtils.clamp(1 - (getMaxScroll() - scrollY) / screenHeight, 0, 1);
  return (exit + enter) / 2;
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
 * Moves the smoothed scroll position a bit closer to the real one.
 * @param deltaSeconds - Time since the last frame in seconds.
 * @returns Path progress between 0 and 1.
 */
export function updateSmoothProgress(deltaSeconds: number) {
  const factor = 1 - Math.exp(-8 * deltaSeconds);
  smoothScrollY += (window.scrollY - smoothScrollY) * factor;
  return getPathProgress();
}
