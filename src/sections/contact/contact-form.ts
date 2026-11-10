type Control = HTMLInputElement | HTMLTextAreaElement;

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
 * Enables the submit button only when every required control is valid.
 * @param controls - All required controls of the form.
 * @param submit - Submit button.
 */
function updateSubmit(controls: Control[], submit: HTMLButtonElement) {
  submit.disabled = !controls.every(isValid);
}

/**
 * Re-validates while typing only if the control already shows an error, so errors never appear mid-input.
 * @param control - Control that received input.
 */
function revalidateIfInvalid(control: Control) {
  if (control.type === 'checkbox' || control.getAttribute('aria-invalid') === 'true') validate(control);
}

/**
 * Sets up blur validation and the submit button state of the contact form.
 */
export function initContactForm() {
  const form = document.querySelector<HTMLFormElement>('.contact__form')!;
  const controls = [...form.querySelectorAll<Control>('[required]')];
  const submit = form.querySelector<HTMLButtonElement>('.contact__submit')!;
  controls.forEach((control) => {
    control.dataset.placeholder = control.placeholder;
    control.addEventListener('blur', () => validate(control));
    control.addEventListener('input', () => {
      revalidateIfInvalid(control);
      updateSubmit(controls, submit);
    });
  });
  form.addEventListener('submit', (event) => event.preventDefault());
  updateSubmit(controls, submit);
}
