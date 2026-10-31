/**
 * Gera public/og.jpg (1200x630), public/favicon.svg, favicon-32.png e apple-touch-icon.png
 * a partir de src/data/restaurant.ts. Rode com: npm run og
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import opentype from 'opentype.js';
import { restaurant as r } from '../src/data/restaurant.ts';

const root = path.resolve(import.meta.dirname, '..');
const pub = path.join(root, 'public');
const fontDir = path.join(root, 'node_modules/@fontsource/cormorant-garamond/files');
const font = (w) => {
  const b = fs.readFileSync(path.join(fontDir, `cormorant-garamond-latin-${w}-normal.woff`));
  return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
};
const light = font(300);
const regular = font(400);

const textPath = (f, text, x, y, size, fill, spacing = 0) => {
  const p = f.getPath(text, 0, 0, size, { letterSpacing: spacing });
  const bb = p.getBoundingBox();
  const d = f.getPath(text, x, y, size, { letterSpacing: spacing }).toPathData(2);
  return { svg: `<path d="${d}" fill="${fill}"/>`, width: bb.x2 - bb.x1 };
};

// Imagem Open Graph
const photo = await fetch(
  `https://images.unsplash.com/photo-${r.hero.photo.id}?fm=jpg&fit=crop&crop=entropy&w=940&h=630&q=80`
).then((res) => res.arrayBuffer());

const name = textPath(light, r.name, 72, 420, 220, '#F5F5F2', -0.02);
const tagline = textPath(regular, r.tagline, 76, 500, 40, '#F5F5F2');
const meta = `${r.neighborhood.toUpperCase()} · ${r.city.toUpperCase()}`;
const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#080808" stop-opacity=".92"/>
      <stop offset=".45" stop-color="#080808" stop-opacity=".55"/>
      <stop offset=".8" stop-color="#080808" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="seam" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#080808" stop-opacity="1"/>
      <stop offset="1" stop-color="#080808" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect x="258" width="260" height="630" fill="url(#seam)"/>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect x="76" y="96" width="40" height="1" fill="#C6A15B"/>
  <text x="132" y="101" font-family="Arial, sans-serif" font-size="15" letter-spacing="4" fill="#C6A15B">${meta}</text>
  ${name.svg}
  ${tagline.svg}
  <rect x="76" y="548" width="1048" height="1" fill="#C6A15B" fill-opacity=".3"/>
</svg>`;

const shot = await sharp(Buffer.from(photo)).modulate({ saturation: 0.86, brightness: 0.92 }).toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#080808' } })
  .composite([{ input: shot, left: 260, top: 0 }, { input: Buffer.from(overlay) }])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(path.join(pub, 'og.jpg'));

// Favicon com a inicial
const initial = r.name.charAt(0).toUpperCase();
const glyph = regular.getPath(initial, 0, 0, 52);
const bb = glyph.getBoundingBox();
const gx = 32 - (bb.x1 + bb.x2) / 2;
const gy = 32 - (bb.y1 + bb.y2) / 2;
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="6" fill="#080808"/>
  <path d="${regular.getPath(initial, gx, gy, 52).toPathData(2)}" fill="#F5F5F2"/>
  <circle cx="50" cy="50" r="3" fill="#8B1717"/>
</svg>`;
fs.writeFileSync(path.join(pub, 'favicon.svg'), favicon);
await sharp(Buffer.from(favicon)).resize(32, 32).png().toFile(path.join(pub, 'favicon-32.png'));
await sharp(Buffer.from(favicon)).resize(180, 180).png().toFile(path.join(pub, 'apple-touch-icon.png'));

console.log('OK: og.jpg, favicon.svg, favicon-32.png, apple-touch-icon.png');
