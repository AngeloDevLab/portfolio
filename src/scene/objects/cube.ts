import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { easeInSoft } from '../easing.ts';

const ENTER_START = 0.15;
const LAND_START = 0.4;
const LAND_END = 0.6;
const EXIT_END = 0.85;
const enterOffset = new THREE.Vector3(-10, -8, -5);
const exitOffset = new THREE.Vector3(10, 8, -5);
const FLATTEN_RANGE = 0.1;
const MIN_DEPTH = 0.001;
const CORNER_RADIUS = 30;
const CORNER_SEGMENTS = 6;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
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
 * Turns scroll progress into the flight state of the cube.
 * @param progress - Scroll progress between 0 and 1.
 * @returns -1 at the enter corner, 0 while landed in the slot, 1 at the exit corner.
 */
function getFlight(progress: number) {
  if (reducedMotion.matches) return 0;
  const toLanding = THREE.MathUtils.clamp((progress - ENTER_START) / (LAND_START - ENTER_START), 0, 1);
  const toExit = THREE.MathUtils.clamp((progress - LAND_END) / (EXIT_END - LAND_END), 0, 1);
  return easeInSoft(toExit) - easeInSoft(1 - toLanding);
}

/**
 * Places the cube so its front face covers the slot, then shifts it along its flight path. It is flat while landed, so no side shows through the perspective.
 * @param cube - Cube to place.
 * @param camera - Camera that views the cube.
 * @param slot - Screen position of the element the cube lands on.
 * @param flight - Flight state between -1 and 1.
 */
function placeCube(cube: THREE.Mesh, camera: THREE.PerspectiveCamera, slot: DOMRect, flight: number) {
  const viewHeight = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const pixelsPerUnit = window.innerHeight / viewHeight;
  const size = slot.width / pixelsPerUnit;
  const x = (slot.left + slot.width / 2 - window.innerWidth / 2) / pixelsPerUnit;
  const y = (window.innerHeight / 2 - (slot.top + slot.height / 2)) / pixelsPerUnit;
  const depth = size * Math.max(MIN_DEPTH, THREE.MathUtils.smoothstep(Math.abs(flight), 0, FLATTEN_RANGE));
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
  const flight = getFlight(progress);
  cube.visible = Math.abs(flight) < 1;
  roundCorners(cube, slot.width);
  placeCube(cube, camera, slot, flight);
  cube.rotation.x = flight * Math.PI;
  cube.rotation.y = flight * Math.PI * 2;
}
