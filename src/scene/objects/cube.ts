import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { getFlight, getFlightDepth, type FlightRanges } from '../flight.ts';
import { getSlotTransform } from '../stage.ts';
import type { LandingOffsets } from '../../scroll.ts';

const RANGES: FlightRanges = { enter: 0.5, exit: 0.5 };
const enterOffset = new THREE.Vector3(-10, -8, -5);
const exitOffset = new THREE.Vector3(10, 8, -5);
const CORNER_RADIUS = 30;
const CORNER_SEGMENTS = 6;
const FADE_RANGE = 0.06;
const FACE_IMAGES = ['me_left', 'me_arms', 'me_right'];
let roundedForWidth = 0;

export type Cube = THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial[]>;

/**
 * Creates the cube with one photo on each pair of opposite faces. The front face shows the same photo as the slot.
 * @returns The cube mesh.
 */
export function createCube(): Cube {
  const loader = new THREE.TextureLoader();
  const pairs = FACE_IMAGES.map((name) => new THREE.MeshStandardMaterial({ map: createTexture(loader, name), transparent: true }));
  const materials = pairs.flatMap((material) => [material, material]);
  return new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), materials);
}

/**
 * Loads one photo as a texture.
 * @param loader - Loader for the image.
 * @param name - File name of the photo without extension.
 * @returns The texture.
 */
function createTexture(loader: THREE.TextureLoader, name: string) {
  const texture = loader.load(`${import.meta.env.BASE_URL}images/${name}.webp`);
  texture.colorSpace = THREE.SRGBColorSpace;
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
 * Cross-fades between the cube in flight and the photo element once landed.
 * @param cube - Cube to fade.
 * @param slot - Photo element the cube lands on.
 * @param flight - Flight state between -1 and 1.
 */
function fadeCube(cube: Cube, slot: HTMLElement, flight: number) {
  const distance = Math.abs(flight);
  const fade = THREE.MathUtils.smoothstep(distance, 0, FADE_RANGE);
  slot.style.opacity = String(1 - fade);
  cube.material.forEach((material) => (material.opacity = fade));
  cube.visible = distance > 0 && distance < 1;
}

/**
 * Flies the cube into the slot, keeps it there facing the camera and flies it out again.
 * @param cube - Cube to update.
 * @param camera - Camera that views the cube.
 * @param slot - Photo element the cube lands on.
 * @param offsets - Landing offsets of the slot.
 */
export function updateCube(cube: Cube, camera: THREE.PerspectiveCamera, slot: HTMLElement, offsets: LandingOffsets) {
  const flight = getFlight(offsets, RANGES);
  const rect = slot.getBoundingClientRect();
  fadeCube(cube, slot, flight);
  roundCorners(cube, rect.width);
  placeCube(cube, camera, rect, flight);
  cube.rotation.x = flight * Math.PI;
  cube.rotation.y = flight * Math.PI * 2;
}
