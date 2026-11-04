import * as THREE from 'three';
import { easeInSoft, easeOutSoft } from '../easing.ts';

const centerPosition = new THREE.Vector3(0, 0, 0);
const exitPosition = new THREE.Vector3(10, 8, -5);
const enterPosition = new THREE.Vector3(-10, -8, -5);

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
 * Updates position and rotation of the cube for the given progress.
 * @param cube - Cube to update.
 * @param progress - Scroll progress between 0 and 1.
 */
export function updateCube(cube: THREE.Mesh, progress: number) {
  updateCubePosition(cube, progress);
  updateCubeRotation(cube, progress);
}

/**
 * Moves the cube from the center to the exit corner, then from the enter corner back to the center.
 * @param cube - Cube to move.
 * @param progress - Scroll progress between 0 and 1.
 */
function updateCubePosition(cube: THREE.Mesh, progress: number) {
  if (progress < 0.5) {
    cube.position.lerpVectors(centerPosition, exitPosition, easeInSoft(progress * 2));
  } else {
    cube.position.lerpVectors(enterPosition, centerPosition, easeOutSoft((progress - 0.5) * 2));
  }
}

/**
 * Rotates the cube based on scroll progress, ending in the same orientation it started with.
 * @param cube - Cube to rotate.
 * @param progress - Scroll progress between 0 and 1.
 */
function updateCubeRotation(cube: THREE.Mesh, progress: number) {
  cube.rotation.x = progress * Math.PI * 2;
  cube.rotation.y = progress * Math.PI * 4;
}
