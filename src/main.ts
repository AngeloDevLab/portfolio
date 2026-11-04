import './styles/main.scss';
import { createStage, resizeStage } from './scene/stage.ts';
import { createCube, updateCube } from './scene/objects/cube.ts';
import { initScrollLoop, loopScroll, updateSmoothProgress } from './scene/scroll.ts';

const canvas = document.querySelector<HTMLCanvasElement>('.scene')!;
const stage = createStage(canvas);
const cube = createCube();
stage.scene.add(cube);

let lastTime = 0;

/**
 * Updates the cube from the smoothed scroll progress and renders the frame.
 * @param time - Milliseconds since the page started.
 */
function animate(time: number) {
  const deltaSeconds = (time - lastTime) / 1000;
  lastTime = time;
  updateCube(cube, updateSmoothProgress(deltaSeconds));
  stage.renderer.render(stage.scene, stage.camera);
}

window.addEventListener('resize', () => resizeStage(stage));
initScrollLoop();
window.addEventListener('scroll', loopScroll);
stage.renderer.setAnimationLoop(animate);
