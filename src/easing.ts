/**
 * Starts slow and accelerates towards the end, but never fully stops at the start.
 * @param t - Linear value between 0 and 1.
 * @returns Eased value between 0 and 1.
 */
export function easeInSoft(t: number) {
  return 0.3 * t + 0.7 * t * t * t;
}

/**
 * Starts fast and slows down towards the end, but never fully stops at the end.
 * @param t - Linear value between 0 and 1.
 * @returns Eased value between 0 and 1.
 */
export function easeOutSoft(t: number) {
  return 1 - easeInSoft(1 - t);
}
