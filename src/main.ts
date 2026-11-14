import './styles/main.scss';
import { initScrollLoop, jumpToHeroOnClick, keepFocusOutOfHeroCopy, loopScroll } from './scene/scroll.ts';
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

const heroes = document.querySelectorAll<HTMLElement>('.hero');

/**
 * Loads three.js once the page has finished loading, starts the 3D scene and keeps the ring texts in the active language.
 */
async function loadScene() {
  const { startScene, setSceneTexts } = await import('./scene/scene.ts');
  const scene = startScene({
    canvas: document.querySelector<HTMLCanvasElement>('.scene')!,
    waterCanvas: document.querySelector<HTMLCanvasElement>('.water')!,
    cubeSlot: document.querySelector<HTMLElement>('.about__photo')!,
    heroes,
    ringBlur: document.querySelector<HTMLElement>('.ring-blur')!,
    skillsSection: document.querySelector<HTMLElement>('.skills')!,
    skillsGrid: document.querySelector<HTMLElement>('.skills__grid')!,
    skillSlots: [...document.querySelectorAll<HTMLElement>('[data-skill]')],
  });
  const showRingTexts = () => setSceneTexts(scene, RING_TEXT_KEYS.map(translate));
  showRingTexts();
  onLanguageChange(showRingTexts);
}

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
initScrollLoop();
initHeader(heroes);
jumpToHeroOnClick(heroes[1]);
keepFocusOutOfHeroCopy(heroes[1]);
window.addEventListener('scroll', loopScroll);
window.addEventListener('load', loadScene, { once: true });
