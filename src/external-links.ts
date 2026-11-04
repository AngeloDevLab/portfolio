/**
 * Makes every link that leads to another website open in a new tab.
 */
export function openExternalLinksInNewTab() {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="http"]').forEach((link) => {
    if (link.hostname !== window.location.hostname) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
  });
}
