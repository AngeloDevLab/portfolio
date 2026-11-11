import { en, type Dictionary, type TranslationKey } from './en.ts';
import { de } from './de.ts';

export type Language = 'en' | 'de';

const DICTIONARIES: Record<Language, Dictionary> = { en, de };
const STORAGE_KEY = 'language';
const listeners: ((language: Language) => void)[] = [];
let current: Language = 'en';

/**
 * Checks whether a value is a supported language.
 * @param value - Value to check.
 * @returns True for 'en' and 'de'.
 */
function isLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'de';
}

/**
 * Reads the language the visitor picked on an earlier visit.
 * @returns The stored language, or null if none is stored or storage is blocked.
 */
function readStoredLanguage(): Language | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isLanguage(stored) ? stored : null;
  } catch {
    return null;
  }
}

/**
 * Remembers the picked language for the next visit and the other pages.
 * @param language - Picked language.
 */
function storeLanguage(language: Language) {
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {}
}

/**
 * Returns the stored language, or German for German browsers and English for all others.
 * @returns Language to start with.
 */
function getInitialLanguage(): Language {
  return readStoredLanguage() ?? (navigator.language.toLowerCase().startsWith('de') ? 'de' : 'en');
}

/**
 * Fills every element with a data-i18n key with its translated text.
 * @param dictionary - Texts of the active language.
 */
function translateTexts(dictionary: Dictionary) {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((element) => {
    element.textContent = dictionary[element.dataset.i18n as TranslationKey];
  });
}

/**
 * Fills every element with a data-i18n-html key with its translated markup.
 * @param dictionary - Texts of the active language.
 */
function translateHtml(dictionary: Dictionary) {
  document.querySelectorAll<HTMLElement>('[data-i18n-html]').forEach((element) => {
    element.innerHTML = dictionary[element.dataset.i18nHtml as TranslationKey];
  });
}

/**
 * Sets the attributes listed in data-i18n-attr, written as "attribute:key; attribute:key".
 * @param dictionary - Texts of the active language.
 */
function translateAttributes(dictionary: Dictionary) {
  document.querySelectorAll<HTMLElement>('[data-i18n-attr]').forEach((element) => {
    element.dataset.i18nAttr!.split(';').forEach((pair) => {
      const [attribute, key] = pair.split(':').map((part) => part.trim());
      element.setAttribute(attribute, dictionary[key as TranslationKey]);
    });
  });
}

/**
 * Highlights the active language in every language toggle.
 * @param language - Active language.
 */
function updateToggles(language: Language) {
  document.querySelectorAll<HTMLElement>('.lang-toggle__option').forEach((option) => {
    option.classList.toggle('lang-toggle__option--active', option.dataset.lang === language);
  });
}

/**
 * Shows only the blocks written in the active language, e.g. the legal texts.
 * @param language - Active language.
 */
function updateLanguageBlocks(language: Language) {
  document.querySelectorAll<HTMLElement>('[data-lang-block]').forEach((block) => {
    block.hidden = block.lang !== language;
  });
}

/**
 * Switches all texts of the page to a language and informs the listeners.
 * @param language - Language to show.
 */
function setLanguage(language: Language) {
  const dictionary = DICTIONARIES[language];
  current = language;
  document.documentElement.lang = language;
  translateTexts(dictionary);
  translateHtml(dictionary);
  translateAttributes(dictionary);
  updateToggles(language);
  updateLanguageBlocks(language);
  listeners.forEach((listener) => listener(language));
}

/**
 * Returns the text of a key in the active language.
 * @param key - Translation key.
 * @returns Translated text.
 */
export function translate(key: TranslationKey): string {
  return DICTIONARIES[current][key];
}

/**
 * Registers a function that runs after every language switch, including the first one.
 * @param listener - Function that receives the new language.
 */
export function onLanguageChange(listener: (language: Language) => void) {
  listeners.push(listener);
}

/**
 * Switches to the other language and remembers the choice.
 */
function toggleLanguage() {
  const language = current === 'en' ? 'de' : 'en';
  storeLanguage(language);
  setLanguage(language);
}

/**
 * Connects the language toggles and shows the page in the stored or browser language.
 */
export function initI18n() {
  document.querySelectorAll('.lang-toggle').forEach((toggle) => toggle.addEventListener('click', toggleLanguage));
  setLanguage(getInitialLanguage());
}
