import { createCanvas, registerFont } from 'canvas';
import path from 'path';

export function generateSignatureImage(name: string) {
  registerFont(
    path.join(process.cwd(), 'src/app', 'fonts', 'AlexBrush-Regular.ttf'),
    { family: 'Alex Brush' }
  );

  const fontSize = 64;

  const tempCanvas = createCanvas(1, 1);
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.font = `${fontSize}px "Alex Brush"`;

  const textWidth = tempCtx.measureText(name).width;

  const padding = 20;
  const canvas = createCanvas(textWidth + padding * 2, fontSize + padding * 2);
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.font = `${fontSize}px "Alex Brush"`;
  ctx.fillStyle = '#000';
  ctx.fillText(name, padding, fontSize + padding / 2);

  const base64String = canvas.toBuffer('image/png').toString('base64');

  return `data:image/png;base64,${base64String}`;
}
