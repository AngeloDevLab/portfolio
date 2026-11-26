import { MathUtils } from 'three';
import { easeInSoft } from './easing.ts';
import type { LandingOffsets } from '../scroll.ts';

const MIN_DEPTH = 0.001;
const FLATTEN_RANGE = 0.1;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

export interface FlightRanges {
  enter: number;
  exit: number;
}

/**
 * Turns the landing offsets of the target element into the flight state of an object that flies in, stays landed while the target is fully visible and flies out again. With reduced motion it stays landed.
 * @param offsets - Scroll distance of the target to being fully visible and since it started leaving, in screen heights.
 * @param ranges - Scroll distance of the fly in and the fly out, in screen heights.
 * @returns -1 at the enter position, 0 while landed, 1 at the exit position.
 */
export function getFlight(offsets: LandingOffsets, ranges: FlightRanges) {
  if (reducedMotion.matches) return 0;
  const toLanding = MathUtils.clamp(1 - offsets.enter / ranges.enter, 0, 1);
  const toExit = MathUtils.clamp(offsets.exit / ranges.exit, 0, 1);
  return easeInSoft(toExit) - easeInSoft(1 - toLanding);
}

/**
 * Returns the depth share of a flying object. It is almost flat while landed, so no side shows through the perspective.
 * @param flight - Flight state between -1 and 1.
 * @param maxDepth - Depth share in full flight.
 * @returns Depth as a share of the object size.
 */
export function getFlightDepth(flight: number, maxDepth = 1) {
  return Math.max(MIN_DEPTH, maxDepth * MathUtils.smoothstep(Math.abs(flight), 0, FLATTEN_RANGE));
}
