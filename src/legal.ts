import './styles/legal.scss';
import { openExternalLinksInNewTab } from './external-links.ts';
import { initCursorGlow } from './cursor-glow.ts';
import { initI18n } from './i18n/i18n.ts';

initI18n();
openExternalLinksInNewTab();
initCursorGlow();
