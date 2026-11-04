import './styles/main.scss';
import { createStage, resizeStage } from './scene/stage.ts';
import { createCube, updateCube } from './scene/objects/cube.ts';
import { createRing, updateRing } from './scene/objects/ring.ts';
import { updateRingBlur } from './scene/objects/ring-blur.ts';
import { getVisibleBottom, initScrollLoop, loopScroll, updateSmoothProgress } from './scene/scroll.ts';
import { openExternalLinksInNewTab } from './external-links.ts';

const canvas = document.querySelector<HTMLCanvasElement>('.scene')!;
const aboutSection = document.querySelector<HTMLElement>('#about')!;
const heroes = document.querySelectorAll<HTMLElement>('.hero');
const ringBlur = document.querySelector<HTMLElement>('.ring-blur')!;
const stage = createStage(canvas);
const cube = createCube();
const ring = createRing(stage.renderer.capabilities.getMaxAnisotropy());
stage.scene.add(cube, ring.group);

let lastTime = 0;

/**
 * Updates the 3D objects from the scroll position and renders the frame.
 * @param time - Milliseconds since the page started.
 */
function animate(time: number) {
  const deltaSeconds = (time - lastTime) / 1000;
  lastTime = time;
  updateCube(cube, updateSmoothProgress(deltaSeconds, aboutSection));
  updateRing(ring, stage.camera, getVisibleBottom(heroes), deltaSeconds);
  updateRingBlur(ringBlur, ring, stage.camera);
  stage.renderer.render(stage.scene, stage.camera);
}

openExternalLinksInNewTab();
window.addEventListener('resize', () => resizeStage(stage));
initScrollLoop();
window.addEventListener('scroll', loopScroll);
stage.renderer.setAnimationLoop(animate);
