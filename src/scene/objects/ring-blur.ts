import * as THREE from 'three';
import type { Ring } from './ring.ts';

const SAMPLES = 48;
const point = new THREE.Vector3();

/**
 * Projects one point on the front of the band to screen pixels.
 * @param ring - Ring that holds the band.
 * @param camera - Camera that views the ring.
 * @param angle - Position around the band in radians, 0 is the front center.
 * @param y - Height on the band, 0.5 is the top edge and -0.5 the bottom edge.
 * @returns The point as a CSS polygon coordinate.
 */
function projectToScreen(ring: Ring, camera: THREE.PerspectiveCamera, angle: number, y: number) {
  point.set(Math.sin(angle), y, Math.cos(angle));
  ring.front.localToWorld(point).project(camera);
  const x = ((point.x + 1) / 2) * window.innerWidth;
  const top = ((1 - point.y) / 2) * window.innerHeight;
  return `${x.toFixed(1)}px ${top.toFixed(1)}px`;
}

/**
 * Traces one long edge of the visible band from left to right.
 * @param ring - Ring that holds the band.
 * @param camera - Camera that views the ring.
 * @param y - Height of the edge on the band.
 * @returns Polygon coordinates along the edge.
 */
function traceEdge(ring: Ring, camera: THREE.PerspectiveCamera, y: number) {
  return Array.from({ length: SAMPLES + 1 }, (_, index) => {
    const angle = (index / SAMPLES - 0.5) * Math.PI;
    return projectToScreen(ring, camera, angle, y);
  });
}

/**
 * Cuts the blur layer to the current outline of the band, so it stays exactly behind it.
 * @param layer - Element that blurs the content behind it.
 * @param ring - Ring to follow.
 * @param camera - Camera that views the ring.
 */
export function updateRingBlur(layer: HTMLElement, ring: Ring, camera: THREE.PerspectiveCamera) {
  layer.hidden = !ring.group.visible;
  if (layer.hidden) return;
  layer.style.opacity = String(ring.front.material.opacity);
  ring.group.updateMatrixWorld();
  const outline = [...traceEdge(ring, camera, 0.5), ...traceEdge(ring, camera, -0.5).reverse()];
  layer.style.clipPath = `polygon(${outline.join(', ')})`;
}
