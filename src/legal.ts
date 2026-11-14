import './styles/legal.scss';
import { openExternalLinksInNewTab } from './external-links.ts';
import { initCursorGlow } from './cursor-glow.ts';
import { initI18n } from './i18n/i18n.ts';

/**
 * Sets up texts, external links and the cursor glow of the imprint and privacy pages.
 */
function initLegalPage() {
  initI18n();
  openExternalLinksInNewTab();
  initCursorGlow();
}

initLegalPage();
