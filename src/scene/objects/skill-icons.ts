import * as THREE from 'three';
import { SVGLoader, type SVGResult } from 'three/addons/loaders/SVGLoader.js';
import { easeInSoft } from '../easing.ts';
import { getSlotTransform } from '../stage.ts';

const ENTER_START = 0.1;
const LAND_START = 0.3;
const EXIT_START = 0.62;
const EXIT_END = 0.85;
const STAGGER = 0.08;
const FLY_DISTANCE = 9;
const FLY_BACK = 4;
const MAX_DEPTH = 0.25;
const MIN_DEPTH = 0.001;
const FLATTEN_RANGE = 0.1;
const FADE_RANGE = 0.06;
const GOLDEN_ANGLE = 2.4;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

interface SkillIcon {
  mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
  element: HTMLElement;
  stagger: number;
  direction: THREE.Vector2;
  spin: number;
}

export interface SkillIcons {
  group: THREE.Group;
  icons: SkillIcon[];
}

/**
 * Creates one extruded 3D icon per given element.
 * @param elements - Icon elements with the icon file name in data-skill.
 * @returns The icons and the group that holds their meshes.
 */
export function createSkillIcons(elements: HTMLElement[]): SkillIcons {
  const icons = elements.map((element, index) => createIcon(element, index, elements.length));
  const group = new THREE.Group();
  group.add(...icons.map((icon) => icon.mesh));
  return { group, icons };
}

/**
 * Creates the mesh and flight data of one icon. The color is taken over from the element.
 * @param element - Icon element the mesh lands on.
 * @param index - Position of the icon in the list.
 * @param total - Number of icons in the list.
 * @returns The created icon.
 */
function createIcon(element: HTMLElement, index: number, total: number): SkillIcon {
  const color = new THREE.Color(getComputedStyle(element).backgroundColor);
  const material = new THREE.MeshStandardMaterial({ color, transparent: true, roughness: 0.4 });
  const mesh = new THREE.Mesh(new THREE.BufferGeometry(), material);
  mesh.visible = false;
  loadGeometry(mesh, element.dataset.skill!);
  const angle = index * GOLDEN_ANGLE;
  const direction = new THREE.Vector2(Math.cos(angle), Math.sin(angle)).multiplyScalar(FLY_DISTANCE);
  return { mesh, element, stagger: (index / total) * STAGGER, direction, spin: index % 2 ? 1 : -1 };
}

/**
 * Loads an icon file and replaces the geometry of the mesh with it.
 * @param mesh - Mesh that receives the geometry.
 * @param name - File name of the icon without extension.
 */
function loadGeometry(mesh: SkillIcon['mesh'], name: string) {
  new SVGLoader().load(`${import.meta.env.BASE_URL}icons/skills/${name}.svg`, (data) => {
    mesh.geometry.dispose();
    mesh.geometry = buildGeometry(data);
  });
}

/**
 * Extrudes the shapes of an SVG into a centered geometry that fits a box of size 1.
 * @param data - Parsed SVG file.
 * @returns The extruded geometry.
 */
function buildGeometry(data: SVGResult) {
  const shapes = data.paths.flatMap((path) => path.toShapes());
  const geometry = new THREE.ExtrudeGeometry(shapes, { depth: 1, bevelEnabled: false });
  const box = (data.xml as unknown as SVGSVGElement).viewBox.baseVal;
  const unit = 1 / Math.max(box.width, box.height);
  geometry.translate(-box.x - box.width / 2, -box.y - box.height / 2, -0.5);
  geometry.scale(unit, unit, 1);
  return geometry;
}

/**
 * Turns scroll progress into the flight state of one icon.
 * @param progress - Scroll progress between 0 and 1.
 * @param stagger - Delay of this icon in scroll progress.
 * @returns -1 at the enter position, 0 while landed, 1 at the exit position.
 */
function getFlight(progress: number, stagger: number) {
  if (reducedMotion.matches) return 0;
  const toLanding = THREE.MathUtils.clamp((progress - ENTER_START - stagger) / (LAND_START - ENTER_START), 0, 1);
  const toExit = THREE.MathUtils.clamp((progress - EXIT_START - stagger) / (EXIT_END - EXIT_START), 0, 1);
  return easeInSoft(toExit) - easeInSoft(1 - toLanding);
}

/**
 * Places an icon on its element, then shifts and turns it along its flight path. It is flat when landed, so it matches the element.
 * @param icon - Icon to place.
 * @param camera - Camera that views the icon.
 * @param flight - Flight state between -1 and 1.
 */
function placeIcon({ mesh, element, direction, spin }: SkillIcon, camera: THREE.PerspectiveCamera, flight: number) {
  const { size, x, y } = getSlotTransform(camera, element.getBoundingClientRect());
  const distance = Math.abs(flight);
  const depth = size * Math.max(MIN_DEPTH, MAX_DEPTH * THREE.MathUtils.smoothstep(distance, 0, FLATTEN_RANGE));
  mesh.scale.set(size, -size, depth);
  mesh.position.set(x + direction.x * flight, y + direction.y * flight, -depth / 2 - FLY_BACK * distance);
  mesh.rotation.set(flight * Math.PI * spin, flight * Math.PI * 2, 0);
}

/**
 * Returns how visible the flying icons may be, so they only show while their section is on screen.
 * @param section - Screen position of the section.
 * @returns 1 while the section fills the screen, 0 once it has left, a value in between during the fades.
 */
function getSectionFade(section: DOMRect) {
  const height = window.innerHeight;
  const fadeIn = 1 - THREE.MathUtils.smoothstep(section.top, height * 0.6, height * 0.9);
  const fadeOut = THREE.MathUtils.smoothstep(section.bottom, height * 0.1, height * 0.4);
  return Math.min(fadeIn, fadeOut);
}

/**
 * Updates one icon and cross-fades between the 3D icon in flight and the element once landed.
 * @param icon - Icon to update.
 * @param camera - Camera that views the icon.
 * @param progress - Scroll progress between 0 and 1.
 * @param sectionFade - Visibility of the section between 0 and 1.
 */
function updateIcon(icon: SkillIcon, camera: THREE.PerspectiveCamera, progress: number, sectionFade: number) {
  const flight = getFlight(progress, icon.stagger);
  const distance = Math.abs(flight);
  const fade = THREE.MathUtils.smoothstep(distance, 0, FADE_RANGE);
  icon.element.style.opacity = String(1 - fade);
  icon.mesh.material.opacity = fade * sectionFade;
  icon.mesh.visible = distance > 0 && distance < 1 && sectionFade > 0;
  if (icon.mesh.visible) placeIcon(icon, camera, flight);
}

/**
 * Flies the icons in one after the other, keeps them in place and flies them out again.
 * @param skillIcons - Icons to update.
 * @param camera - Camera that views the icons.
 * @param section - Screen position of the section the icons belong to.
 * @param progress - Scroll progress between 0 and 1.
 */
export function updateSkillIcons({ icons }: SkillIcons, camera: THREE.PerspectiveCamera, section: DOMRect, progress: number) {
  const sectionFade = getSectionFade(section);
  icons.forEach((icon) => updateIcon(icon, camera, progress, sectionFade));
}
