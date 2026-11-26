let smoothScrollY = window.scrollY;

export interface LandingOffsets {
  enter: number;
  exit: number;
}

/**
 * Measures how far an element is from being fully visible, based on the smoothed scroll position. An element taller than the screen counts as fully visible while its center is at the screen center.
 * @param element - Element to measure against.
 * @returns Scroll distance in screen heights: enter until the element is fully visible (0 once it is), exit since it started leaving at the top (0 before).
 */
export function getLandingOffsets(element: HTMLElement): LandingOffsets {
  const screenHeight = window.innerHeight;
  const top = element.offsetTop - smoothScrollY;
  const bottom = top + element.offsetHeight;
  const centerOffset = (top + bottom) / 2 - screenHeight / 2;
  const enter = Math.max(Math.min(bottom - screenHeight, centerOffset), 0);
  const exit = Math.max(Math.min(-top, -centerOffset), 0);
  return { enter: enter / screenHeight, exit: exit / screenHeight };
}

/**
 * Checks whether an element is at least partly inside the viewport.
 * @param element - Element to check.
 * @returns True if any part of the element is visible.
 */
export function isInViewport(element: HTMLElement) {
  const { top, bottom } = element.getBoundingClientRect();
  return bottom > 0 && top < window.innerHeight;
}

/**
 * Returns the bottom edge of an element while it is inside the viewport.
 * @param element - Element to check.
 * @returns Bottom edge in pixels, or null if the element is not visible.
 */
export function getVisibleBottom(element: HTMLElement) {
  return isInViewport(element) ? element.getBoundingClientRect().bottom : null;
}

/**
 * Moves the smoothed scroll position a bit closer to the real one.
 * @param deltaSeconds - Time since the last frame in seconds.
 */
export function updateSmoothScroll(deltaSeconds: number) {
  const factor = 1 - Math.exp(-8 * deltaSeconds);
  smoothScrollY += (window.scrollY - smoothScrollY) * factor;
}
