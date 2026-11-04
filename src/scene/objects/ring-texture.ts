import * as THREE from 'three';

const TEXTS = ['Open to work', 'Frontend Developer', 'Based in Saxony', 'Available for remote work'];
const HEIGHT = 128;
const FONT = '400 64px Karla';
const GAP = 80;
const DOT_SIZE = 12;
const BACKGROUND = 'rgba(255, 255, 255, 0.12)';
const ACCENT = '#3dcfb6';

/**
 * Measures the width of one full text pattern including gaps and dots.
 * @returns Pattern width in texture pixels.
 */
function measurePattern() {
  const context = document.createElement('canvas').getContext('2d')!;
  context.font = FONT;
  const separators = TEXTS.length * (2 * GAP + DOT_SIZE);
  return TEXTS.reduce((sum, text) => sum + context.measureText(text).width, separators);
}

/**
 * Draws the strip background and the repeating texts with their dots.
 * @param context - Drawing context of the texture canvas.
 */
function drawPattern(context: CanvasRenderingContext2D) {
  context.fillStyle = BACKGROUND;
  context.fillRect(0, 0, context.canvas.width, HEIGHT);
  context.font = FONT;
  context.textBaseline = 'middle';
  context.fillStyle = ACCENT;
  let x = 0;
  TEXTS.forEach((text) => {
    context.fillText(text, x, HEIGHT / 2);
    x += context.measureText(text).width + GAP;
    context.beginPath();
    context.arc(x + DOT_SIZE / 2, HEIGHT / 2, DOT_SIZE / 2, 0, Math.PI * 2);
    context.fill();
    x += DOT_SIZE + GAP;
  });
}

/**
 * Waits for the font and creates the repeating strip texture of the ring.
 * @param maxAnisotropy - Highest texture filtering level the device supports.
 * @param blur - Blur radius of the drawing in texture pixels.
 * @returns The finished texture.
 */
export async function createRingTexture(maxAnisotropy: number, blur = 0) {
  await document.fonts.load(FONT);
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(measurePattern());
  canvas.height = HEIGHT;
  const context = canvas.getContext('2d')!;
  context.filter = `blur(${blur}px)`;
  drawPattern(context);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.anisotropy = maxAnisotropy;
  return texture;
}
