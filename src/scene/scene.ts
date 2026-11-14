import { createStage, resizeStage, type Stage } from './stage.ts';
import { createCube, updateCube } from './objects/cube.ts';
import { createRing, setRingTexts, updateRing, type Ring } from './objects/ring.ts';
import { updateRingBlur } from './objects/ring-blur.ts';
import { createSkillIcons, updateSkillIcons, type SkillIcons } from './objects/skill-icons.ts';
import { createWater, dropIntoWater, liftWaterPointer, moveWaterPointer, resizeWater, updateWater, type Water } from './water.ts';
import { getElementProgress, getVisibleBottom, updateSmoothProgress } from './scroll.ts';

const WATER_QUERY = '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

export interface SceneElements {
  canvas: HTMLCanvasElement;
  waterCanvas: HTMLCanvasElement;
  cubeSlot: HTMLElement;
  heroes: NodeListOf<HTMLElement>;
  ringBlur: HTMLElement;
  skillsSection: HTMLElement;
  skillsGrid: HTMLElement;
  skillSlots: HTMLElement[];
}

export interface Scene3d {
  elements: SceneElements;
  stage: Stage;
  cube: ReturnType<typeof createCube>;
  ring: Ring;
  skillIcons: SkillIcons;
  water: Water | null;
  lastTime: number;
}

/**
 * Feeds mouse moves, clicks and window size changes into the water background.
 * @param water - Water state.
 */
function connectWater(water: Water) {
  document.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'mouse') moveWaterPointer(water, event.clientX, event.clientY);
  });
  document.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse') dropIntoWater(water, event.clientX, event.clientY);
  });
  document.documentElement.addEventListener('mouseleave', () => liftWaterPointer(water));
  window.addEventListener('resize', () => resizeWater(water));
}

/**
 * Updates the 3D objects from the scroll position and renders one frame.
 * @param scene - Scene state.
 * @param time - Milliseconds since the page started.
 */
function renderFrame(scene: Scene3d, time: number) {
  const { elements: el, stage, ring } = scene;
  const deltaSeconds = (time - scene.lastTime) / 1000;
  scene.lastTime = time;
  updateCube(scene.cube, stage.camera, el.cubeSlot.getBoundingClientRect(), updateSmoothProgress(deltaSeconds, el.cubeSlot));
  updateRing(ring, stage.camera, getVisibleBottom(el.heroes), deltaSeconds);
  updateRingBlur(el.ringBlur, ring, stage.camera);
  updateSkillIcons(scene.skillIcons, stage.camera, el.skillsSection.getBoundingClientRect(), getElementProgress(el.skillsGrid));
  stage.renderer.render(stage.scene, stage.camera);
  if (scene.water) updateWater(scene.water, deltaSeconds);
}

/**
 * Builds the 3D objects and the water background and starts the render loop.
 * @param elements - Page elements the scene reads positions from or draws into.
 * @returns Scene state.
 */
export function startScene(elements: SceneElements): Scene3d {
  const stage = createStage(elements.canvas);
  const ring = createRing(stage.renderer.capabilities.getMaxAnisotropy());
  const water = window.matchMedia(WATER_QUERY).matches ? createWater(elements.waterCanvas) : null;
  const scene: Scene3d = { elements, stage, cube: createCube(), ring, skillIcons: createSkillIcons(elements.skillSlots), water, lastTime: performance.now() };
  stage.scene.add(scene.cube, ring.group, scene.skillIcons.group);
  if (water) connectWater(water);
  window.addEventListener('resize', () => resizeStage(stage));
  stage.renderer.setAnimationLoop((time) => renderFrame(scene, time));
  return scene;
}

/**
 * Shows new texts on the hero ring, e.g. after a language switch.
 * @param scene - Scene state.
 * @param texts - Ring texts in display order.
 */
export function setSceneTexts(scene: Scene3d, texts: string[]) {
  setRingTexts(scene.ring, texts);
}
