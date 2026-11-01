/**
 * Builds public/og.jpg (1200x630), public/favicon.svg, favicon-32.png and apple-touch-icon.png
 * from src/data/site.ts. No photo needed: the share image draws a Margherita. Run: npm run og
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import opentype from 'opentype.js';
import { site as s } from '../src/data/site.ts';

const root = path.resolve(import.meta.dirname, '..');
const pub = path.join(root, 'public');
const fontDir = path.join(root, 'node_modules/@fontsource/fraunces/files');
const font = (w, style = 'normal') => {
  const b = fs.readFileSync(path.join(fontDir, `fraunces-latin-${w}-${style}.woff`));
  return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
};
const regular = font(400);
const italic = font(300, 'italic');

// Glyph by glyph: opentype.js's string layout returns NaN coordinates for some pairs in
// this font (the name came out broken), so advance by each glyph's own width instead.
const textPath = (f, text, x, y, size, fill) => {
  const scale = size / f.unitsPerEm;
  let d = '';
  let cx = x;
  for (const ch of text) {
    const g = f.charToGlyph(ch);
    // transform the raw outline ourselves (getPath on a reused glyph can return NaN)
    const X = (v) => (cx + v * scale).toFixed(2);
    const Y = (v) => (y - v * scale).toFixed(2);
    for (const c of g.path.commands) {
      if (c.type === 'M' || c.type === 'L') d += `${c.type}${X(c.x)} ${Y(c.y)}`;
      else if (c.type === 'Q') d += `Q${X(c.x1)} ${Y(c.y1)} ${X(c.x)} ${Y(c.y)}`;
      else if (c.type === 'C') d += `C${X(c.x1)} ${Y(c.y1)} ${X(c.x2)} ${Y(c.y2)} ${X(c.x)} ${Y(c.y)}`;
      else if (c.type === 'Z') d += 'Z';
    }
    cx += g.advanceWidth * scale;
  }
  return `<path d="${d}" fill="${fill}"/>`;
};

/** Margherita drawn in SVG: dough, tomato, mozzarella, basil, leopard spots */
function pizza(cx, cy, R) {
  let out = `<circle cx="${cx + R * 0.04}" cy="${cy + R * 0.07}" r="${R}" fill="#3c1e0a" fill-opacity=".18"/>`;
  out += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#c98b4a"/><circle cx="${cx}" cy="${cy}" r="${R * 0.9}" fill="#e3b06d"/>`;
  out += `<circle cx="${cx}" cy="${cy}" r="${R * 0.8}" fill="#b7321d"/>`;
  const cheese = [[-0.3, -0.32, 0.17], [0.28, -0.4, 0.14], [0.36, 0.14, 0.16], [-0.06, 0.4, 0.15], [-0.42, 0.18, 0.13], [0.02, -0.04, 0.12]];
  cheese.forEach(([x, y, r]) => (out += `<circle cx="${cx + x * R}" cy="${cy + y * R}" r="${r * R}" fill="#fbf3e2"/>`));
  const basil = [[0.06, -0.3, 30], [-0.22, 0.02, -40], [0.24, 0.34, 70]];
  basil.forEach(([x, y, a]) => (out += `<ellipse cx="${cx + x * R}" cy="${cy + y * R}" rx="${R * 0.11}" ry="${R * 0.055}" transform="rotate(${a} ${cx + x * R} ${cy + y * R})" fill="#3b5a34"/>`));
  for (let i = 0; i < 26; i++) {
    const a = i * 2.39;
    const d = i % 3 === 0 ? 0.5 + ((i * 37) % 30) / 100 : 0.92;
    out += `<circle cx="${cx + Math.cos(a) * d * R}" cy="${cy + Math.sin(a) * d * R}" r="${R * (0.012 + (i % 4) * 0.006)}" fill="#301a0e" fill-opacity=".7"/>`;
  }
  return out;
}

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#0f0c0b"/>
  <circle cx="930" cy="330" r="380" fill="#6b1d2b" fill-opacity=".35"/>
  ${pizza(930, 330, 280)}
  <rect x="80" y="104" width="10" height="10" rx="5" fill="#c9a45c"/>
  <text x="104" y="114" font-family="Arial, sans-serif" font-weight="700" font-size="16" letter-spacing="3" fill="#c9a45c">PIZZARIA ARTESANAL · ${s.city.toUpperCase()}</text>
  ${textPath(regular, s.name, 80, 320, 136, '#f2e8d6')}
  ${textPath(italic, 'Delivery, salão e festas.', 80, 420, 44, '#d4b46e')}
  ${textPath(italic, 'Rodízio toda sexta.', 80, 474, 44, '#d4b46e')}
  <rect x="0" y="606" width="1200" height="24" fill="#c9a45c"/>
</svg>`;
await sharp(Buffer.from(og)).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(pub, 'og.jpg'));

// Favicon: a tiny Margherita
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="#c98b4a"/><circle cx="32" cy="32" r="25" fill="#b7321d"/>
  <circle cx="24" cy="24" r="6" fill="#fbf3e2"/><circle cx="41" cy="38" r="6.5" fill="#fbf3e2"/><circle cx="25" cy="42" r="4.5" fill="#fbf3e2"/>
  <ellipse cx="40" cy="22" rx="6" ry="3" transform="rotate(-30 40 22)" fill="#3b5a34"/>
</svg>`;
fs.writeFileSync(path.join(pub, 'favicon.svg'), favicon);
await sharp(Buffer.from(favicon)).resize(32, 32).png().toFile(path.join(pub, 'favicon-32.png'));
const touch = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#0f0c0b"/>${favicon.replace(/<\/?svg[^>]*>/g, '')}</svg>`;
await sharp(Buffer.from(touch)).resize(180, 180).png().toFile(path.join(pub, 'apple-touch-icon.png'));

console.log('OK: og.jpg, favicon.svg, favicon-32.png, apple-touch-icon.png');
