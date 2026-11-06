import * as THREE from 'three';

export interface Stage {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
}

/**
 * Creates the scene, camera, renderer and lights needed to draw on the given canvas.
 * @param canvas - Canvas element the renderer draws into.
 * @returns The created stage.
 */
export function createStage(canvas: HTMLCanvasElement): Stage {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 3;
  const renderer = createRenderer(canvas);
  addLights(scene);
  return { scene, camera, renderer };
}

/**
 * Creates a renderer sized to the window with a capped pixel ratio.
 * @param canvas - Canvas element the renderer draws into.
 * @returns The configured renderer.
 */
function createRenderer(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  return renderer;
}

/**
 * Adds a soft ambient light, a side light and a front light to the scene.
 * @param scene - Scene that receives the lights.
 */
function addLights(scene: THREE.Scene) {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
  directionalLight.position.set(3, 2, 0);
  const frontLight = new THREE.DirectionalLight(0xffffff, 1.6);
  frontLight.position.set(0, 0.4, 1);
  scene.add(ambientLight, directionalLight, frontLight);
}

/**
 * Converts the screen position of an element into world units on the plane at z = 0.
 * @param camera - Camera that views the plane.
 * @param slot - Screen position of the element.
 * @returns Width and center of the element in world units.
 */
export function getSlotTransform(camera: THREE.PerspectiveCamera, slot: DOMRect) {
  const viewHeight = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const pixelsPerUnit = window.innerHeight / viewHeight;
  return {
    size: slot.width / pixelsPerUnit,
    x: (slot.left + slot.width / 2 - window.innerWidth / 2) / pixelsPerUnit,
    y: (window.innerHeight / 2 - (slot.top + slot.height / 2)) / pixelsPerUnit,
  };
}

/**
 * Updates camera aspect ratio and renderer size to match the window.
 * @param stage - Stage to resize.
 */
export function resizeStage({ camera, renderer }: Stage) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
