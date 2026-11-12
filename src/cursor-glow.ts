const MOUSE_QUERY = '(hover: hover) and (pointer: fine)';
const FOLLOW_SPEED = 8;

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const glowPosition = { x: 0, y: 0 };
const pointerPosition = { x: 0, y: 0 };
let lastTime = 0;
let frame = 0;

/**
 * Moves the glow a bit closer to the pointer and keeps going until it has caught up.
 * @param glow - Glow element.
 * @param time - Frame timestamp in milliseconds.
 */
function followPointer(glow: HTMLElement, time: number) {
  const factor = lastTime ? 1 - Math.exp(-FOLLOW_SPEED * (time - lastTime) / 1000) : 0;
  lastTime = time;
  glowPosition.x += (pointerPosition.x - glowPosition.x) * factor;
  glowPosition.y += (pointerPosition.y - glowPosition.y) * factor;
  glow.style.translate = `${glowPosition.x}px ${glowPosition.y}px`;
  if (Math.hypot(pointerPosition.x - glowPosition.x, pointerPosition.y - glowPosition.y) < 0.5) {
    frame = 0;
    lastTime = 0;
    return;
  }
  frame = requestAnimationFrame((nextTime) => followPointer(glow, nextTime));
}

/**
 * Stores the new pointer position, shows the glow and starts following. The glow jumps instead when it was hidden or motion is reduced.
 * @param glow - Glow element.
 * @param event - Pointer event.
 */
function onPointerMove(glow: HTMLElement, event: PointerEvent) {
  if (event.pointerType !== 'mouse') return;
  pointerPosition.x = event.clientX;
  pointerPosition.y = event.clientY;
  if (reducedMotion.matches || !glow.classList.contains('cursor-glow--visible')) {
    glowPosition.x = pointerPosition.x;
    glowPosition.y = pointerPosition.y;
  }
  glow.classList.add('cursor-glow--visible');
  if (!frame) frame = requestAnimationFrame((time) => followPointer(glow, time));
}

/**
 * Lets a soft glow behind the content follow the mouse. Does nothing on touch devices.
 */
export function initCursorGlow() {
  if (!window.matchMedia(MOUSE_QUERY).matches) return;
  const glow = document.querySelector<HTMLElement>('.cursor-glow')!;
  document.addEventListener('pointermove', (event) => onPointerMove(glow, event));
  document.documentElement.addEventListener('mouseleave', () => glow.classList.remove('cursor-glow--visible'));
}
