let smoothScrollY = window.scrollY;

/**
 * Returns the progress of an element passing through the screen: 0.5 when its center is at the screen center, 0 one screen earlier, 1 one screen later.
 * @param element - Element to measure against.
 * @returns Element progress between 0 and 1.
 */
export function getElementProgress(element: HTMLElement) {
  const screenHeight = window.innerHeight;
  const centeredAt = element.offsetTop + element.offsetHeight / 2 - screenHeight / 2;
  const distance = smoothScrollY - centeredAt;
  return Math.min(Math.max((distance + screenHeight) / (2 * screenHeight), 0), 1);
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
 * @param element - Element the progress is measured against.
 * @returns Element progress between 0 and 1.
 */
export function updateSmoothProgress(deltaSeconds: number, element: HTMLElement) {
  const factor = 1 - Math.exp(-8 * deltaSeconds);
  smoothScrollY += (window.scrollY - smoothScrollY) * factor;
  return getElementProgress(element);
}
