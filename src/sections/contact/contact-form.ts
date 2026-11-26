import { hideToast, renderToast, showToast } from './contact-toast.ts';

type Control = HTMLInputElement | HTMLTextAreaElement;

interface ContactForm {
  form: HTMLFormElement;
  controls: Control[];
  submit: HTMLButtonElement;
  toast: HTMLElement;
  sending: boolean;
}

const EMAIL_PATTERN = /^[^\s@.]+(\.[^\s@.]+)*@([\p{L}\d]([\p{L}\d-]*[\p{L}\d])?\.)+\p{L}{2,}$/u;

/**
 * Checks whether a required form control holds a valid value.
 * @param control - Text field, email field, textarea or checkbox.
 * @returns True if the value is valid.
 */
function isValid(control: Control): boolean {
  if (control.type === 'checkbox') return (control as HTMLInputElement).checked;
  const value = control.value.trim();
  if (control.type === 'email') return EMAIL_PATTERN.test(value);
  return value !== '';
}

/**
 * Returns the error text linked to a control via aria-describedby.
 * @param control - Form control.
 * @returns The error text element, or null if the control has none.
 */
function getErrorText(control: Control) {
  const id = control.getAttribute('aria-describedby');
  return id ? document.getElementById(id) : null;
}

/**
 * Shows or clears the error state of a text field. Empty fields show their error as placeholder, filled ones below the field.
 * @param control - Text field, email field or textarea.
 * @param valid - Whether the value is valid.
 */
function renderFieldState(control: Control, valid: boolean) {
  control.closest('.contact__field')!.classList.toggle('contact__field--invalid', !valid);
  control.placeholder = valid ? control.dataset.placeholder! : control.dataset.error!;
  getErrorText(control)?.classList.toggle('contact__field-error--visible', !valid && control.value !== '');
}

/**
 * Shows or hides the error text below the privacy checkbox.
 * @param control - Privacy checkbox.
 * @param valid - Whether the checkbox is checked.
 */
function renderPrivacyState(control: Control, valid: boolean) {
  getErrorText(control)!.classList.toggle('contact__privacy-error--visible', !valid);
}

/**
 * Trims the value of a text control, then validates it and shows the result.
 * @param control - Control to validate.
 */
function validate(control: Control) {
  if (control.type !== 'checkbox') control.value = control.value.trim();
  const valid = isValid(control);
  control.setAttribute('aria-invalid', String(!valid));
  if (control.type === 'checkbox') renderPrivacyState(control, valid);
  else renderFieldState(control, valid);
}

/**
 * Handles input: the checkbox is validated right away, a text field drops its error while the user types.
 * @param control - Control that received input.
 */
function handleInput(control: Control) {
  if (control.type === 'checkbox') return validate(control);
  if (control.getAttribute('aria-invalid') !== 'true') return;
  control.setAttribute('aria-invalid', 'false');
  renderFieldState(control, true);
}

/**
 * Marks the submit button as disabled while a control is invalid or the form is being sent. It stays clickable to show what is missing.
 * @param ctx - Contact form elements and state.
 */
function updateSubmit(ctx: ContactForm) {
  ctx.submit.setAttribute('aria-disabled', String(ctx.sending || !ctx.controls.every(isValid)));
}

/**
 * Validates every control, shows all errors and moves the focus to the first invalid control.
 * @param ctx - Contact form elements and state.
 */
function showAllErrors(ctx: ContactForm) {
  ctx.controls.forEach(validate);
  ctx.controls.find((control) => !isValid(control))?.focus({ focusVisible: true });
}

/**
 * Collects the form values in the shape the n8n webhook expects.
 * @param form - Contact form.
 * @returns Trimmed text values, privacy consent and the honeypot value.
 */
function getPayload(form: HTMLFormElement) {
  const data = new FormData(form);
  const text = (name: string) => String(data.get(name) ?? '').trim();
  return {
    name: text('name'),
    email: text('email'),
    message: text('message'),
    privacy: data.has('privacy'),
    website: text('website'),
  };
}

/**
 * Posts the form as JSON to the webhook URL in its action attribute.
 * @param form - Contact form.
 * @returns True if the webhook confirmed the message.
 */
async function sendForm(form: HTMLFormElement): Promise<boolean> {
  try {
    const response = await fetch(form.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(getPayload(form)),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Shows what is missing if the form is incomplete, otherwise sends it, shows the result and empties the form after a successful send.
 * @param ctx - Contact form elements and state.
 */
async function handleSubmit(ctx: ContactForm) {
  if (ctx.sending) return;
  if (!ctx.controls.every(isValid)) return showAllErrors(ctx);
  ctx.sending = true;
  updateSubmit(ctx);
  hideToast(ctx.toast);
  const sent = await sendForm(ctx.form);
  if (sent) ctx.form.reset();
  showToast(ctx.toast, sent ? 'success' : 'error');
  ctx.sending = false;
  updateSubmit(ctx);
}

/**
 * Finds the contact form elements.
 * @returns Form, required controls, submit button, toast and sending state.
 */
function getContactForm(): ContactForm {
  const form = document.querySelector<HTMLFormElement>('.contact__form')!;
  return {
    form,
    controls: [...form.querySelectorAll<Control>('[required]')],
    submit: form.querySelector<HTMLButtonElement>('.contact__submit')!,
    toast: form.querySelector<HTMLElement>('.contact__toast')!,
    sending: false,
  };
}

/**
 * Sets up blur validation, the submit button state and sending of the contact form.
 */
export function initContactForm() {
  const ctx = getContactForm();
  ctx.controls.forEach((control) => {
    control.addEventListener('blur', () => validate(control));
    control.addEventListener('input', () => {
      handleInput(control);
      updateSubmit(ctx);
    });
  });
  ctx.form.addEventListener('submit', (event) => {
    event.preventDefault();
    handleSubmit(ctx);
  });
  updateSubmit(ctx);
  refreshContactTexts();
}

/**
 * Shows the current placeholder, error and toast texts again, e.g. after their data attributes were translated.
 */
export function refreshContactTexts() {
  const form = document.querySelector<HTMLFormElement>('.contact__form')!;
  form.querySelectorAll<Control>('.contact__input').forEach((control) => {
    renderFieldState(control, control.getAttribute('aria-invalid') !== 'true');
  });
  renderToast(form.querySelector<HTMLElement>('.contact__toast')!);
}
