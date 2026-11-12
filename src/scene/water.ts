import { HalfFloatType, LinearFilter, Mesh, NoBlending, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, Vector2, Vector3, Vector4, WebGLRenderTarget, WebGLRenderer } from 'three';
import { displayFragment, fullscreenVertex, simulationFragment } from './water-shaders.ts';

const SIMULATION_SCALE = 0.25;
const STEP_SECONDS = 1 / 60;
const MAX_STEPS_PER_FRAME = 4;
const SLEEP_AFTER_SECONDS = 4;
const DAMPING = 0.97;
const TRAIL_STRENGTH = 0.15;
const DROP_STRENGTH = 1;
const TEAL = new Vector3(0x3d / 255, 0xcf / 255, 0xb6 / 255);

export type Water = {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: OrthographicCamera;
  quad: Mesh;
  simulation: ShaderMaterial;
  display: ShaderMaterial;
  targets: WebGLRenderTarget[];
  trailFrom: Vector2 | null;
  trailTo: Vector2 | null;
  drop: Vector2 | null;
  stepTime: number;
  awakeSeconds: number;
};

/**
 * Creates a render target that holds the height field of the water.
 * @param width - Width in texels.
 * @param height - Height in texels.
 * @returns New render target.
 */
function createTarget(width: number, height: number) {
  return new WebGLRenderTarget(width, height, {
    type: HalfFloatType,
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    depthBuffer: false,
  });
}

/**
 * Creates a shader material for a fullscreen pass that writes its result without blending.
 * @param fragmentShader - Fragment shader of the pass.
 * @param uniforms - Uniforms of the pass.
 * @returns New shader material.
 */
function createPass(fragmentShader: string, uniforms: ShaderMaterial['uniforms']) {
  return new ShaderMaterial({ vertexShader: fullscreenVertex, fragmentShader, uniforms, blending: NoBlending, depthTest: false });
}

/**
 * Creates the water ripple background on its own canvas. It sleeps until the first disturbance.
 * @param canvas - Canvas behind the page content.
 * @returns Water state.
 */
export function createWater(canvas: HTMLCanvasElement): Water {
  const renderer = new WebGLRenderer({ canvas, alpha: true, premultipliedAlpha: true });
  renderer.setClearColor(0x000000, 0);
  const simulation = createPass(simulationFragment, {
    uState: { value: null }, uTexel: { value: new Vector2() }, uAspect: { value: 1 }, uDamping: { value: DAMPING },
    uTrail: { value: new Vector4() }, uTrailStrength: { value: 0 }, uDrop: { value: new Vector3() },
  });
  const display = createPass(displayFragment, { uState: { value: null }, uTexel: { value: new Vector2() }, uColor: { value: TEAL } });
  const quad = new Mesh(new PlaneGeometry(2, 2), simulation);
  const scene = new Scene().add(quad);
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const water: Water = { renderer, scene, camera, quad, simulation, display, targets: [], trailFrom: null, trailTo: null, drop: null, stepTime: 0, awakeSeconds: SLEEP_AFTER_SECONDS };
  resizeWater(water);
  return water;
}

/**
 * Matches the canvas and the height field to the window size. The water starts calm again.
 * @param water - Water state.
 */
export function resizeWater(water: Water) {
  const { innerWidth: width, innerHeight: height } = window;
  water.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  water.renderer.setSize(width, height, false);
  water.targets.forEach((target) => target.dispose());
  const simWidth = Math.ceil(width * SIMULATION_SCALE);
  const simHeight = Math.ceil(height * SIMULATION_SCALE);
  water.targets = [createTarget(simWidth, simHeight), createTarget(simWidth, simHeight)];
  water.simulation.uniforms.uTexel.value.set(1 / simWidth, 1 / simHeight);
  water.display.uniforms.uTexel.value.set(1 / simWidth, 1 / simHeight);
  water.simulation.uniforms.uAspect.value = width / height;
  water.renderer.clear();
}

/**
 * Converts a window position to texture coordinates of the water.
 * @param x - Horizontal position in pixels.
 * @param y - Vertical position in pixels.
 * @returns Position between 0 and 1, with y pointing up.
 */
function toWaterUv(x: number, y: number) {
  return new Vector2(x / window.innerWidth, 1 - y / window.innerHeight);
}

/**
 * Lets the pointer draw a ripple trail from its last position to the new one.
 * @param water - Water state.
 * @param x - Horizontal pointer position in pixels.
 * @param y - Vertical pointer position in pixels.
 */
export function moveWaterPointer(water: Water, x: number, y: number) {
  water.trailTo = toWaterUv(x, y);
  water.trailFrom ??= water.trailTo;
  water.awakeSeconds = 0;
}

/**
 * Forgets the last pointer position, so the next move does not draw a trail across the screen.
 * @param water - Water state.
 */
export function liftWaterPointer(water: Water) {
  water.trailFrom = null;
  water.trailTo = null;
}

/**
 * Drops a big drop into the water at the given position.
 * @param water - Water state.
 * @param x - Horizontal position in pixels.
 * @param y - Vertical position in pixels.
 */
export function dropIntoWater(water: Water, x: number, y: number) {
  water.drop = toWaterUv(x, y);
  water.awakeSeconds = 0;
}

/**
 * Sets the pointer input of the next simulation step and marks it as used.
 * @param water - Water state.
 */
function applyInput(water: Water) {
  const { uniforms } = water.simulation;
  const { trailFrom, trailTo, drop } = water;
  uniforms.uTrailStrength.value = trailFrom && trailTo && !trailFrom.equals(trailTo) ? TRAIL_STRENGTH : 0;
  if (trailFrom && trailTo) uniforms.uTrail.value.set(trailFrom.x, trailFrom.y, trailTo.x, trailTo.y);
  uniforms.uDrop.value.set(drop?.x ?? 0, drop?.y ?? 0, drop ? DROP_STRENGTH : 0);
  water.trailFrom = trailTo;
  water.drop = null;
}

/**
 * Runs one step of the wave simulation and swaps the two height fields.
 * @param water - Water state.
 * @param withInput - True if this step takes the pointer input.
 */
function simulateStep(water: Water, withInput: boolean) {
  const { uniforms } = water.simulation;
  if (withInput) applyInput(water);
  else uniforms.uTrailStrength.value = uniforms.uDrop.value.z = 0;
  uniforms.uState.value = water.targets[0].texture;
  water.quad.material = water.simulation;
  water.renderer.setRenderTarget(water.targets[1]);
  water.renderer.render(water.scene, water.camera);
  water.targets.reverse();
}

/**
 * Draws the current height field as teal light and soft shadows onto the canvas.
 * @param water - Water state.
 */
function renderWater(water: Water) {
  water.display.uniforms.uState.value = water.targets[0].texture;
  water.quad.material = water.display;
  water.renderer.setRenderTarget(null);
  water.renderer.render(water.scene, water.camera);
}

/**
 * Advances the simulation in fixed steps and draws it. Does nothing while the water sleeps.
 * @param water - Water state.
 * @param deltaSeconds - Time since the last frame in seconds.
 */
export function updateWater(water: Water, deltaSeconds: number) {
  if (water.awakeSeconds >= SLEEP_AFTER_SECONDS) return;
  water.awakeSeconds += deltaSeconds;
  water.stepTime = Math.min(water.stepTime + deltaSeconds, STEP_SECONDS * MAX_STEPS_PER_FRAME);
  for (let step = 0; water.stepTime >= STEP_SECONDS; step++) {
    simulateStep(water, step === 0);
    water.stepTime -= STEP_SECONDS;
  }
  renderWater(water);
  if (water.awakeSeconds >= SLEEP_AFTER_SECONDS) water.renderer.clear();
}
