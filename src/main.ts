import './styles/main.scss';
import { openExternalLinksInNewTab } from './external-links.ts';
import { initCursorGlow } from './cursor-glow.ts';
import { initHeader } from './sections/header/header.ts';
import { initMenu } from './sections/header/menu.ts';
import { initProjectDialog } from './sections/projects/project-dialog.ts';
import { initReferences, labelReferenceDots } from './sections/references/references.ts';
import { initContactForm, refreshContactTexts } from './sections/contact/contact-form.ts';
import { initI18n, onLanguageChange, translate } from './i18n/i18n.ts';
import type { TranslationKey } from './i18n/en.ts';
import type { SceneElements } from './scene/scene.ts';

const RING_TEXT_KEYS: TranslationKey[] = ['ring.role', 'ring.openToWork', 'ring.location', 'ring.remote'];

/**
 * Collects the page elements the 3D scene reads positions from or draws into.
 * @param hero - Hero section.
 * @returns Elements for the scene.
 */
function getSceneElements(hero: HTMLElement): SceneElements {
  return {
    canvas: document.querySelector<HTMLCanvasElement>('.scene')!,
    waterCanvas: document.querySelector<HTMLCanvasElement>('.water')!,
    cubeSlot: document.querySelector<HTMLElement>('.about__photo')!,
    hero,
    ringBlur: document.querySelector<HTMLElement>('.ring-blur')!,
    skillsSection: document.querySelector<HTMLElement>('.skills')!,
    skillsGrid: document.querySelector<HTMLElement>('.skills__grid')!,
    skillSlots: [...document.querySelectorAll<HTMLElement>('[data-skill]')],
  };
}

/**
 * Loads three.js, starts the 3D scene and keeps the ring texts in the active language.
 * @param hero - Hero section.
 */
async function loadScene(hero: HTMLElement) {
  const { startScene, setSceneTexts } = await import('./scene/scene.ts');
  const scene = startScene(getSceneElements(hero));
  const showRingTexts = () => setSceneTexts(scene, RING_TEXT_KEYS.map(translate));
  showRingTexts();
  onLanguageChange(showRingTexts);
}

/**
 * Sets up texts, sections and header of the homepage and starts the 3D scene once the page has finished loading.
 */
function initPage() {
  const hero = document.querySelector<HTMLElement>('.hero')!;
  onLanguageChange(() => {
    labelReferenceDots();
    refreshContactTexts();
  });
  initI18n();
  openExternalLinksInNewTab();
  initCursorGlow();
  initMenu();
  initProjectDialog();
  initReferences();
  initContactForm();
  initHeader(hero);
  window.addEventListener('load', () => loadScene(hero), { once: true });
}

initPage();
