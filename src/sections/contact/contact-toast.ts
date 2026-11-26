export type ToastState = 'success' | 'error';

const DURATIONS: Record<ToastState, number> = { success: 5000, error: 8000 };
let hideTimer = 0;

/**
 * Fills the toast with the text of its state, taken from its data attributes.
 * @param toast - Toast element holding the success and error texts.
 * @param state - State to show, defaults to the last shown one.
 */
export function renderToast(toast: HTMLElement, state = toast.dataset.state as ToastState | undefined) {
  if (!state) return;
  toast.dataset.state = state;
  toast.textContent = toast.dataset[state]!;
  toast.classList.toggle('contact__toast--error', state === 'error');
}

/**
 * Hides the toast right away.
 * @param toast - Toast element.
 */
export function hideToast(toast: HTMLElement) {
  window.clearTimeout(hideTimer);
  toast.classList.remove('contact__toast--visible');
}

/**
 * Shows the toast with the text for the given state and hides it again after a while.
 * @param toast - Toast element.
 * @param state - Success or error.
 */
export function showToast(toast: HTMLElement, state: ToastState) {
  hideToast(toast);
  toast.classList.add('contact__toast--visible');
  renderToast(toast, state);
  hideTimer = window.setTimeout(() => hideToast(toast), DURATIONS[state]);
}
