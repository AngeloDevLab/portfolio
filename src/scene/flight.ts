import { MathUtils } from 'three';
import { easeInSoft } from './easing.ts';

const MIN_DEPTH = 0.001;
const FLATTEN_RANGE = 0.1;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

export interface FlightPhases {
  enterStart: number;
  landStart: number;
  exitStart: number;
  exitEnd: number;
}

/**
 * Turns scroll progress into the flight state of an object that flies in, stays landed and flies out again. With reduced motion it stays landed.
 * @param progress - Scroll progress between 0 and 1.
 * @param phases - Scroll progress at which each part of the flight starts or ends.
 * @param delay - Extra delay of this object in scroll progress.
 * @returns -1 at the enter position, 0 while landed, 1 at the exit position.
 */
export function getFlight(progress: number, { enterStart, landStart, exitStart, exitEnd }: FlightPhases, delay = 0) {
  if (reducedMotion.matches) return 0;
  const toLanding = MathUtils.clamp((progress - delay - enterStart) / (landStart - enterStart), 0, 1);
  const toExit = MathUtils.clamp((progress - delay - exitStart) / (exitEnd - exitStart), 0, 1);
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
