import './styles/main.scss';
import { initScrollLoop, jumpToHeroOnClick, keepFocusOutOfHeroCopy, loopScroll } from './scroll.ts';
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
 * @param heroes - Hero and its copy at the end of the page.
 * @returns Elements for the scene.
 */
function getSceneElements(heroes: NodeListOf<HTMLElement>): SceneElements {
  return {
    canvas: document.querySelector<HTMLCanvasElement>('.scene')!,
    waterCanvas: document.querySelector<HTMLCanvasElement>('.water')!,
    cubeSlot: document.querySelector<HTMLElement>('.about__photo')!,
    heroes,
    ringBlur: document.querySelector<HTMLElement>('.ring-blur')!,
    skillsSection: document.querySelector<HTMLElement>('.skills')!,
    skillsGrid: document.querySelector<HTMLElement>('.skills__grid')!,
    skillSlots: [...document.querySelectorAll<HTMLElement>('[data-skill]')],
  };
}

/**
 * Loads three.js, starts the 3D scene and keeps the ring texts in the active language.
 * @param heroes - Hero and its copy at the end of the page.
 */
async function loadScene(heroes: NodeListOf<HTMLElement>) {
  const { startScene, setSceneTexts } = await import('./scene/scene.ts');
  const scene = startScene(getSceneElements(heroes));
  const showRingTexts = () => setSceneTexts(scene, RING_TEXT_KEYS.map(translate));
  showRingTexts();
  onLanguageChange(showRingTexts);
}

/**
 * Sets up the endless scroll loop, the header and the hero copy at the end of the page.
 * @param heroes - Hero and its copy at the end of the page.
 */
function initScrolling(heroes: NodeListOf<HTMLElement>) {
  initScrollLoop();
  initHeader(heroes);
  jumpToHeroOnClick(heroes[1]);
  keepFocusOutOfHeroCopy(heroes[1]);
  window.addEventListener('scroll', loopScroll);
}

/**
 * Sets up texts, sections and scrolling of the homepage and starts the 3D scene once the page has finished loading.
 */
function initPage() {
  const heroes = document.querySelectorAll<HTMLElement>('.hero');
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
  initScrolling(heroes);
  window.addEventListener('load', () => loadScene(heroes), { once: true });
}

initPage();
