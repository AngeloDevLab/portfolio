const DESKTOP_QUERY = '(min-width: 1024px)';

/**
 * Closes the menu when a click landed on the backdrop or on a link inside it.
 * @param menu - Menu dialog.
 * @param event - Click event from inside the dialog.
 */
function closeOnBackdropOrLink(menu: HTMLDialogElement, event: MouseEvent) {
  const target = event.target as Element;
  if (target === menu || target.closest('a')) menu.close();
}

/**
 * Connects all burger buttons to the menu and closes it again when the layout switches to desktop.
 */
export function initMenu() {
  const menu = document.querySelector<HTMLDialogElement>('.menu')!;
  document.querySelectorAll('.burger').forEach((burger) => {
    burger.addEventListener('click', () => menu.showModal());
  });
  menu.addEventListener('click', (event) => closeOnBackdropOrLink(menu, event));
  window.matchMedia(DESKTOP_QUERY).addEventListener('change', () => menu.close());
}
