import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { getFlight, getFlightDepth, type FlightPhases } from '../flight.ts';
import { getSlotTransform } from '../stage.ts';

const PHASES: FlightPhases = { enterStart: 0.15, landStart: 0.4, exitStart: 0.6, exitEnd: 0.85 };
const enterOffset = new THREE.Vector3(-10, -8, -5);
const exitOffset = new THREE.Vector3(10, 8, -5);
const CORNER_RADIUS = 30;
const CORNER_SEGMENTS = 6;
let roundedForWidth = 0;

/**
 * Creates the textured cube.
 * @returns The cube mesh.
 */
export function createCube() {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ map: createTexture() });
  return new THREE.Mesh(geometry, material);
}

/**
 * Loads the cube image and crops it to a centered square.
 * @returns The texture for the cube faces.
 */
function createTexture() {
  const texture = new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}origin.webp`);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.repeat.x = 768 / 1376;
  texture.offset.x = (1 - texture.repeat.x) / 2;
  return texture;
}

/**
 * Rebuilds the cube geometry when the slot width changes, so the corners keep the radius of the slot.
 * @param cube - Cube to update.
 * @param slotWidth - Width of the slot in pixels.
 */
function roundCorners(cube: THREE.Mesh, slotWidth: number) {
  if (slotWidth === roundedForWidth) return;
  roundedForWidth = slotWidth;
  cube.geometry.dispose();
  cube.geometry = new RoundedBoxGeometry(1, 1, 1, CORNER_SEGMENTS, CORNER_RADIUS / slotWidth);
}

/**
 * Places the cube so its front face covers the slot, then shifts it along its flight path.
 * @param cube - Cube to place.
 * @param camera - Camera that views the cube.
 * @param slot - Screen position of the element the cube lands on.
 * @param flight - Flight state between -1 and 1.
 */
function placeCube(cube: THREE.Mesh, camera: THREE.PerspectiveCamera, slot: DOMRect, flight: number) {
  const { size, x, y } = getSlotTransform(camera, slot);
  const depth = size * getFlightDepth(flight);
  cube.scale.set(size, size, depth);
  cube.position.set(x, y, -depth / 2);
  cube.position.addScaledVector(flight < 0 ? enterOffset : exitOffset, Math.abs(flight));
}

/**
 * Flies the cube into the slot, keeps it there facing the camera and flies it out again.
 * @param cube - Cube to update.
 * @param camera - Camera that views the cube.
 * @param slot - Screen position of the element the cube lands on.
 * @param progress - Scroll progress between 0 and 1.
 */
export function updateCube(cube: THREE.Mesh, camera: THREE.PerspectiveCamera, slot: DOMRect, progress: number) {
  const flight = getFlight(progress, PHASES);
  cube.visible = Math.abs(flight) < 1;
  roundCorners(cube, slot.width);
  placeCube(cube, camera, slot, flight);
  cube.rotation.x = flight * Math.PI;
  cube.rotation.y = flight * Math.PI * 2;
}
