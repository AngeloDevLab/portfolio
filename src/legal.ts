import './styles/legal.scss';
import { openExternalLinksInNewTab } from './external-links.ts';
import { initCursorGlow } from './cursor-glow.ts';
import { initI18n } from './i18n/i18n.ts';
import { initHeader } from './sections/header/header.ts';
import { initMenu } from './sections/header/menu.ts';

/**
 * Sets up texts, header, menu, external links and the cursor glow of the imprint and privacy pages.
 */
function initLegalPage() {
  initI18n();
  initMenu();
  initHeader();
  openExternalLinksInNewTab();
  initCursorGlow();
}

initLegalPage();
