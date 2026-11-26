import * as THREE from 'three';
import { SVGLoader, type SVGResult } from 'three/addons/loaders/SVGLoader.js';
import { getFlight, getFlightDepth, type FlightRanges } from '../flight.ts';
import { getSlotTransform } from '../stage.ts';
import type { LandingOffsets } from '../../scroll.ts';

const RANGES: FlightRanges = { enter: 0.4, exit: 0.46 };
const STAGGER = 0.16;
const FLY_DISTANCE = 9;
const FLY_BACK = 4;
const MAX_DEPTH = 0.25;
const FADE_RANGE = 0.06;
const EDGE_FADE_RANGE = 0.3;
const GOLDEN_ANGLE = 2.4;

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
 * Places an icon on its element, then shifts and turns it along its flight path. It is flat when landed, so it matches the element.
 * @param icon - Icon to place.
 * @param camera - Camera that views the icon.
 * @param flight - Flight state between -1 and 1.
 */
function placeIcon({ mesh, element, direction, spin }: SkillIcon, camera: THREE.PerspectiveCamera, flight: number) {
  const { size, x, y } = getSlotTransform(camera, element.getBoundingClientRect());
  const distance = Math.abs(flight);
  const depth = size * getFlightDepth(flight, MAX_DEPTH);
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
 * Updates one icon and cross-fades between the 3D icon in flight and the element once landed. The 3D icon also fades at the far ends of its flight. Later icons land and leave later, the last one lands once the grid is fully visible.
 * @param icon - Icon to update.
 * @param camera - Camera that views the icon.
 * @param offsets - Landing offsets of the icon grid.
 * @param sectionFade - Visibility of the section between 0 and 1.
 */
function updateIcon(icon: SkillIcon, camera: THREE.PerspectiveCamera, offsets: LandingOffsets, sectionFade: number) {
  const staggered = { enter: offsets.enter - (STAGGER - icon.stagger), exit: offsets.exit - icon.stagger };
  const flight = getFlight(staggered, RANGES);
  const distance = Math.abs(flight);
  const fade = THREE.MathUtils.smoothstep(distance, 0, FADE_RANGE);
  const edgeFade = 1 - THREE.MathUtils.smoothstep(distance, 1 - EDGE_FADE_RANGE, 1);
  icon.element.style.opacity = String(1 - fade);
  icon.mesh.material.opacity = fade * edgeFade * sectionFade;
  icon.mesh.visible = distance > 0 && distance < 1 && sectionFade > 0;
  if (icon.mesh.visible) placeIcon(icon, camera, flight);
}

/**
 * Flies the icons in one after the other, keeps them in place and flies them out again.
 * @param skillIcons - Icons to update.
 * @param camera - Camera that views the icons.
 * @param section - Screen position of the section the icons belong to.
 * @param offsets - Landing offsets of the icon grid.
 */
export function updateSkillIcons({ icons }: SkillIcons, camera: THREE.PerspectiveCamera, section: DOMRect, offsets: LandingOffsets) {
  const sectionFade = getSectionFade(section);
  icons.forEach((icon) => updateIcon(icon, camera, offsets, sectionFade));
}
