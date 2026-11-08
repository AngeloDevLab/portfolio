/**
 * Shows the project at the given index and hides all others.
 * @param dialog - Project dialog.
 * @param projects - Project articles inside the dialog, in list order.
 * @param index - Index of the project to show.
 */
function showProject(dialog: HTMLDialogElement, projects: HTMLElement[], index: number) {
  projects.forEach((project, i) => (project.hidden = i !== index));
  dialog.setAttribute('aria-labelledby', projects[index].querySelector('h2')!.id);
  dialog.scrollTop = 0;
}

/**
 * Closes the dialog when a click landed on its backdrop.
 * @param dialog - Project dialog.
 * @param event - Click event from inside the dialog.
 */
function closeOnBackdrop(dialog: HTMLDialogElement, event: MouseEvent) {
  if (event.target === dialog) dialog.close();
}

/**
 * Opens the project dialog from the project list and lets the user step through all projects.
 */
export function initProjectDialog() {
  const dialog = document.querySelector<HTMLDialogElement>('.project-dialog')!;
  const projects = [...dialog.querySelectorAll<HTMLElement>('.project-dialog__project')];
  let current = 0;
  document.querySelectorAll('.projects__row').forEach((row, index) => {
    row.addEventListener('click', () => {
      current = index;
      showProject(dialog, projects, current);
      dialog.showModal();
    });
  });
  dialog.querySelector('.project-dialog__next')!.addEventListener('click', () => {
    current = (current + 1) % projects.length;
    showProject(dialog, projects, current);
  });
  dialog.querySelector('.project-dialog__close')!.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => closeOnBackdrop(dialog, event));
}
