type Control = HTMLInputElement | HTMLTextAreaElement;

interface ContactForm {
  form: HTMLFormElement;
  controls: Control[];
  submit: HTMLButtonElement;
  status: HTMLElement;
  sending: boolean;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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
 * Shows or clears the error state of a text field. Empty fields show their error text as placeholder.
 * @param control - Text field, email field or textarea.
 * @param valid - Whether the value is valid.
 */
function renderFieldState(control: Control, valid: boolean) {
  control.closest('.contact__field')!.classList.toggle('contact__field--invalid', !valid);
  control.placeholder = valid ? control.dataset.placeholder! : control.dataset.error!;
}

/**
 * Shows or hides the error text below the privacy checkbox.
 * @param control - Privacy checkbox.
 * @param valid - Whether the checkbox is checked.
 */
function renderPrivacyState(control: Control, valid: boolean) {
  const error = document.getElementById(control.getAttribute('aria-describedby')!)!;
  error.classList.toggle('contact__privacy-error--visible', !valid);
}

/**
 * Validates a control and shows the result.
 * @param control - Control to validate.
 */
function validate(control: Control) {
  const valid = isValid(control);
  control.setAttribute('aria-invalid', String(!valid));
  if (control.type === 'checkbox') renderPrivacyState(control, valid);
  else renderFieldState(control, valid);
}

/**
 * Enables the submit button only when every required control is valid and nothing is being sent.
 * @param ctx - Contact form elements and state.
 */
function updateSubmit(ctx: ContactForm) {
  ctx.submit.disabled = ctx.sending || !ctx.controls.every(isValid);
}

/**
 * Re-validates while typing only if the control already shows an error, so errors never appear mid-input.
 * @param control - Control that received input.
 */
function revalidateIfInvalid(control: Control) {
  if (control.type === 'checkbox' || control.getAttribute('aria-invalid') === 'true') validate(control);
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
 * Shows the success or error text of the status line, or clears it.
 * @param status - Status line holding both texts in its data attributes.
 * @param state - Text to show, or null to clear the line.
 */
function renderStatus(status: HTMLElement, state: 'success' | 'error' | null) {
  status.textContent = state ? status.dataset[state]! : '';
  status.classList.toggle('contact__status--error', state === 'error');
}

/**
 * Sends the form, shows the result and empties the form after a successful send.
 * @param ctx - Contact form elements and state.
 */
async function handleSubmit(ctx: ContactForm) {
  if (ctx.sending) return;
  ctx.sending = true;
  updateSubmit(ctx);
  renderStatus(ctx.status, null);
  const sent = await sendForm(ctx.form);
  if (sent) ctx.form.reset();
  renderStatus(ctx.status, sent ? 'success' : 'error');
  ctx.sending = false;
  updateSubmit(ctx);
}

/**
 * Finds the contact form elements.
 * @returns Form, required controls, submit button, status line and sending state.
 */
function getContactForm(): ContactForm {
  const form = document.querySelector<HTMLFormElement>('.contact__form')!;
  return {
    form,
    controls: [...form.querySelectorAll<Control>('[required]')],
    submit: form.querySelector<HTMLButtonElement>('.contact__submit')!,
    status: form.querySelector<HTMLElement>('.contact__status')!,
    sending: false,
  };
}

/**
 * Sets up blur validation, the submit button state and sending of the contact form.
 */
export function initContactForm() {
  const ctx = getContactForm();
  ctx.controls.forEach((control) => {
    control.dataset.placeholder = control.placeholder;
    control.addEventListener('blur', () => validate(control));
    control.addEventListener('input', () => {
      revalidateIfInvalid(control);
      updateSubmit(ctx);
    });
  });
  ctx.form.addEventListener('submit', (event) => {
    event.preventDefault();
    handleSubmit(ctx);
  });
  updateSubmit(ctx);
}
