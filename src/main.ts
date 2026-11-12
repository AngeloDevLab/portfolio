import './styles/main.scss';
import { createStage, resizeStage } from './scene/stage.ts';
import { createCube, updateCube } from './scene/objects/cube.ts';
import { createRing, setRingTexts, updateRing } from './scene/objects/ring.ts';
import { updateRingBlur } from './scene/objects/ring-blur.ts';
import { createSkillIcons, updateSkillIcons } from './scene/objects/skill-icons.ts';
import { createWater, dropIntoWater, liftWaterPointer, moveWaterPointer, resizeWater, updateWater, type Water } from './scene/water.ts';
import { getElementProgress, getVisibleBottom, initScrollLoop, jumpToHeroOnClick, keepFocusOutOfHeroCopy, loopScroll, updateSmoothProgress } from './scene/scroll.ts';
import { openExternalLinksInNewTab } from './external-links.ts';
import { initCursorGlow } from './cursor-glow.ts';
import { initHeader } from './sections/header/header.ts';
import { initMenu } from './sections/header/menu.ts';
import { initProjectDialog } from './sections/projects/project-dialog.ts';
import { initReferences, labelReferenceDots } from './sections/references/references.ts';
import { initContactForm, refreshContactTexts } from './sections/contact/contact-form.ts';
import { initI18n, onLanguageChange, translate } from './i18n/i18n.ts';
import type { TranslationKey } from './i18n/en.ts';

const RING_TEXT_KEYS: TranslationKey[] = ['ring.role', 'ring.openToWork', 'ring.location', 'ring.remote'];
const WATER_QUERY = '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

const canvas = document.querySelector<HTMLCanvasElement>('.scene')!;
const cubeSlot = document.querySelector<HTMLElement>('.about__photo')!;
const heroes = document.querySelectorAll<HTMLElement>('.hero');
const ringBlur = document.querySelector<HTMLElement>('.ring-blur')!;
const skillsSection = document.querySelector<HTMLElement>('.skills')!;
const skillsGrid = document.querySelector<HTMLElement>('.skills__grid')!;
const skillSlots = [...document.querySelectorAll<HTMLElement>('[data-skill]')];
const stage = createStage(canvas);
const cube = createCube();
const ring = createRing(stage.renderer.capabilities.getMaxAnisotropy());
const skillIcons = createSkillIcons(skillSlots);
stage.scene.add(cube, ring.group, skillIcons.group);
const water = window.matchMedia(WATER_QUERY).matches ? createWater(document.querySelector<HTMLCanvasElement>('.water')!) : null;

let lastTime = 0;

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
 * Updates the 3D objects from the scroll position and renders the frame.
 * @param time - Milliseconds since the page started.
 */
function animate(time: number) {
  const deltaSeconds = (time - lastTime) / 1000;
  lastTime = time;
  updateCube(cube, stage.camera, cubeSlot.getBoundingClientRect(), updateSmoothProgress(deltaSeconds, cubeSlot));
  updateRing(ring, stage.camera, getVisibleBottom(heroes), deltaSeconds);
  updateRingBlur(ringBlur, ring, stage.camera);
  updateSkillIcons(skillIcons, stage.camera, skillsSection.getBoundingClientRect(), getElementProgress(skillsGrid));
  stage.renderer.render(stage.scene, stage.camera);
  if (water) updateWater(water, deltaSeconds);
}

onLanguageChange(() => {
  setRingTexts(ring, RING_TEXT_KEYS.map(translate));
  labelReferenceDots();
  refreshContactTexts();
});
initI18n();
openExternalLinksInNewTab();
initCursorGlow();
if (water) connectWater(water);
initMenu();
initProjectDialog();
initReferences();
initContactForm();
window.addEventListener('resize', () => resizeStage(stage));
initScrollLoop();
initHeader(heroes);
jumpToHeroOnClick(heroes[1]);
keepFocusOutOfHeroCopy(heroes[1]);
window.addEventListener('scroll', loopScroll);
stage.renderer.setAnimationLoop(animate);
