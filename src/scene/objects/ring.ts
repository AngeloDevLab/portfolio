import * as THREE from 'three';
import { createRingTexture } from './ring-texture.ts';

const TILT = THREE.MathUtils.degToRad(3);
const MAX_SCROLL_TILT = 0.3;
const WIDTH_PER_HALF_VIEWPORT = 2;
const DEPTH_PER_VIEW_HEIGHT = 0.4;
const CENTER_ABOVE_HERO_BOTTOM = 64;
const SPEED_IN_PIXELS = 40;
const BACK_BLUR = 6;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

type Band = THREE.Mesh<THREE.CylinderGeometry, THREE.MeshStandardMaterial>;

export interface Ring {
  group: THREE.Group;
  front: Band;
  back: Band;
  lastHeroBottom: number | null;
}

/**
 * Creates one side of the band with a lit, partly self-glowing material.
 * @param geometry - Shared band geometry.
 * @param side - Which faces of the band this mesh shows.
 * @param color - Light response of the material.
 * @param glow - Share of the texture that stays visible without light.
 * @returns The band mesh.
 */
function createBand(geometry: THREE.CylinderGeometry, side: THREE.Side, color: number, glow: number): Band {
  const material = new THREE.MeshStandardMaterial({
    side, color, transparent: true, depthWrite: false, roughness: 0.6, emissive: 0xffffff, emissiveIntensity: glow,
  });
  const band = new THREE.Mesh(geometry, material);
  band.visible = false;
  return band;
}

/**
 * Applies a texture to a band and shows it.
 * @param band - Band that receives the texture.
 * @param texture - Finished texture.
 */
function applyTexture(band: Band, texture: THREE.CanvasTexture) {
  band.material.map = texture;
  band.material.emissiveMap = texture;
  band.material.needsUpdate = true;
  band.visible = true;
}

/**
 * Creates the tilted ring from a sharp front and a blurred, darker back.
 * @param maxAnisotropy - Highest texture filtering level the device supports.
 * @returns The ring parts.
 */
export function createRing(maxAnisotropy: number): Ring {
  const geometry = new THREE.CylinderGeometry(1, 1, 1, 256, 1, true);
  const front = createBand(geometry, THREE.FrontSide, 0xffffff, 0.35);
  const back = createBand(geometry, THREE.BackSide, 0x737373, 0.2);
  const group = new THREE.Group();
  group.rotation.z = TILT;
  front.renderOrder = 1;
  group.add(back, front);
  createRingTexture(maxAnisotropy).then((texture) => applyTexture(front, texture));
  createRingTexture(maxAnisotropy, BACK_BLUR).then((texture) => applyTexture(back, texture));
  return { group, front, back, lastHeroBottom: null };
}

/**
 * Returns the band height in pixels, matching fluid(48px, 64px).
 * @returns Band height in pixels.
 */
function getBandHeight() {
  const progress = THREE.MathUtils.clamp((window.innerWidth - 320) / (1440 - 320), 0, 1);
  return THREE.MathUtils.lerp(48, 64, progress);
}

/**
 * Repeats a texture a whole number of times around the ring.
 * @param band - Band that holds the texture.
 * @param radiusX - Ring width radius in world units.
 * @param patternLength - Length of one text pattern in world units.
 */
function repeatTexture(band: Band, radiusX: number, patternLength: number) {
  if (band.material.map) {
    band.material.map.repeat.x = Math.max(1, Math.round((2 * Math.PI * radiusX) / patternLength));
  }
}

/**
 * Returns the length of one text pattern at the given band height.
 * @param band - Band that holds the texture.
 * @param bandHeight - Band height in any unit.
 * @returns Pattern length in the same unit, or 0 while the texture is loading.
 */
function getPatternLength(band: Band, bandHeight: number) {
  const image = band.material.map?.image as HTMLCanvasElement | undefined;
  return image ? bandHeight * (image.width / image.height) : 0;
}

/**
 * Sizes and places the ring at the bottom of the hero and tips it while the hero scrolls away.
 * @param ring - Ring to place.
 * @param camera - Camera that views the ring.
 * @param heroBottom - Bottom edge of the visible hero in pixels.
 */
function layoutRing({ group, front, back }: Ring, camera: THREE.PerspectiveCamera, heroBottom: number) {
  const viewHeight = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const pixelsPerUnit = window.innerHeight / viewHeight;
  const radiusX = ((viewHeight * camera.aspect) / 2) * WIDTH_PER_HALF_VIEWPORT;
  const radiusZ = viewHeight * DEPTH_PER_VIEW_HEIGHT;
  const height = getBandHeight() / pixelsPerUnit;
  const centerY = heroBottom - CENTER_ABOVE_HERO_BOTTOM;
  group.position.set(0, (window.innerHeight / 2 - centerY) / pixelsPerUnit, -radiusZ);
  group.rotation.x = Math.min(1, Math.abs(window.innerHeight - heroBottom) / window.innerHeight) * MAX_SCROLL_TILT;
  [front, back].forEach((band) => {
    band.scale.set(radiusX, height, radiusZ);
    repeatTexture(band, radiusX, getPatternLength(band, height));
  });
}

/**
 * Moves the text around the ring, driven by time and by the scroll distance.
 * @param ring - Ring to spin.
 * @param heroBottom - Bottom edge of the visible hero in pixels.
 * @param deltaSeconds - Time since the last frame in seconds.
 */
function spinRing(ring: Ring, heroBottom: number, deltaSeconds: number) {
  const scrolled = ring.lastHeroBottom === null ? 0 : ring.lastHeroBottom - heroBottom;
  ring.lastHeroBottom = heroBottom;
  if (reducedMotion.matches) return;
  const pixels = SPEED_IN_PIXELS * deltaSeconds + scrolled;
  [ring.front, ring.back].forEach((band) => {
    const patternPixels = getPatternLength(band, getBandHeight());
    if (band.material.map && patternPixels) band.material.map.offset.x += pixels / patternPixels;
  });
}

/**
 * Updates the ring for the current frame and hides it while no hero is visible.
 * @param ring - Ring to update.
 * @param camera - Camera that views the ring.
 * @param heroBottom - Bottom edge of the visible hero in pixels, or null if no hero is visible.
 * @param deltaSeconds - Time since the last frame in seconds.
 */
export function updateRing(ring: Ring, camera: THREE.PerspectiveCamera, heroBottom: number | null, deltaSeconds: number) {
  ring.group.visible = heroBottom !== null;
  if (heroBottom === null) {
    ring.lastHeroBottom = null;
    return;
  }
  layoutRing(ring, camera, heroBottom);
  spinRing(ring, heroBottom, deltaSeconds);
}
