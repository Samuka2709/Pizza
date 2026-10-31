/**
 * Main animation (home hero): a real Margherita, and as the visitor scrolls the
 * toppings lift off it — mozzarella with strings of cheese stretching back to the
 * pizza, basil leaves spinning up — hover for a moment, then settle back down.
 *
 * Everything is a cut-out from real photos (public/img/hero). Scroll progress 0 → 1
 * through the sticky hero drives the motion, smoothed so it never looks stepped:
 *   0.00–0.08  the pizza alone, steam rising
 *   0.08–0.50  toppings lift off, cheese stretches
 *   0.50–0.72  they float at the top
 *   0.72–0.96  they fall back onto the pizza
 * A small idle float runs only while the hero is on screen. With reduced motion the
 * toppings are drawn once, frozen mid-air, and nothing moves.
 */

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeIn = (t: number) => t * t * t;
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

type Kind = 'cheese' | 'basil';
interface Piece {
  src: string;
  kind: Kind;
  /** Where it starts, on the pizza (units of R from the pizza centre) */
  from: [number, number];
  /** Where it floats to */
  to: [number, number];
  /** Width in units of R */
  size: number;
  rot: [number, number];
  /** 0..1 stagger */
  delay: number;
}

const PIECES: Piece[] = [
  { src: 'basil', kind: 'basil', from: [0.12, -0.25], to: [0.32, -1.5], size: 0.62, rot: [0.2, -0.5], delay: 0.1 },
  { src: 'mozzarella', kind: 'cheese', from: [-0.05, 0.05], to: [-0.15, -1.18], size: 0.34, rot: [0, -0.35], delay: 0 },
  { src: 'melt-1', kind: 'cheese', from: [0.0, -0.16], to: [0.58, -0.98], size: 0.4, rot: [0, 0.5], delay: 0.08 },
  { src: 'mozzarella', kind: 'cheese', from: [-0.02, -0.45], to: [-0.66, -0.92], size: 0.24, rot: [1.2, 0.4], delay: 0.16 },
  { src: 'mozzarella', kind: 'cheese', from: [0.55, -0.2], to: [1.02, -0.6], size: 0.2, rot: [2.2, 3], delay: 0.22 },
  { src: 'melt-2', kind: 'cheese', from: [-0.42, 0.3], to: [-1.0, -0.42], size: 0.24, rot: [0.6, 1.4], delay: 0.18 },
  { src: 'basil', kind: 'basil', from: [-0.3, -0.1], to: [-0.82, -1.38], size: 0.4, rot: [2.4, 1.6], delay: 0.2 },
  { src: 'basil', kind: 'basil', from: [0.45, 0.2], to: [1.08, -1.25], size: 0.3, rot: [-1.2, -2.3], delay: 0.26 },
];

const SOURCES = ['pizza', 'basil', 'mozzarella', 'melt-1', 'melt-2'];
const images = new Map<string, HTMLImageElement>();

function load(name: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      images.set(name, img);
      resolve();
    };
    img.onerror = () => resolve();
    img.src = `/img/hero/${name}.webp`;
  });
}

// Embers and flour in the air, placed once with a fixed seed
let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const motes = Array.from({ length: 46 }, () => ({
  x: rnd() * 2.6 - 1.3,
  y: rnd() * 1.6 - 1.2,
  r: 0.5 + rnd() * 1.8,
  speed: 0.3 + rnd() * 0.8,
  ember: rnd() < 0.35,
  phase: rnd() * Math.PI * 2,
}));

export function initPizza(opts: { reduced: boolean }) {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-pizza]');
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!canvas || !hero) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let w = 0;
  let h = 0;
  let dpr = 1;
  let target = opts.reduced ? 0.6 : 0;
  let current = target;
  let visible = true;
  let raf = 0;

  function layout() {
    const rect = canvas!.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas!.width = Math.round(w * dpr);
    canvas!.height = Math.round(h * dpr);
  }

  function geometry() {
    if (w >= 900) return { cx: w * 0.68, cy: h * 0.72, R: Math.min(w * 0.25, h * 0.38), lift: 1 };
    // Phones: the text sits above the pizza, so the toppings rise less
    return { cx: w * 0.52, cy: h * 0.86, R: Math.min(w * 0.52, h * 0.26), lift: 0.55 };
  }

  function drawImg(name: string, x: number, y: number, width: number, rot: number, alpha = 1) {
    const img = images.get(name);
    if (!img) return;
    const height = width * (img.naturalHeight / img.naturalWidth);
    ctx!.save();
    ctx!.globalAlpha = alpha;
    ctx!.translate(x, y);
    ctx!.rotate(rot);
    ctx!.drawImage(img, -width / 2, -height / 2, width, height);
    ctx!.restore();
  }

  /** Strings of melted cheese: gooey, thick where they leave the pizza and the piece, thin in the middle */
  function cheeseStrings(x0: number, y0: number, x1: number, y1: number, width: number, lift: number, R: number, i: number, time: number) {
    if (lift < 0.02) return;
    const stretch = Math.hypot(x1 - x0, y1 - y0) / R;
    const strands = [-0.32, -0.08, 0.14, 0.34];
    strands.forEach((f, k) => {
      const sx = x0 + f * width * 1.1;
      const ex = x1 + f * width * 0.7;
      const ey = y1 + width * 0.22;
      const sway = Math.sin(time * 1.5 + i * 1.7 + k * 2.1) * R * 0.02;
      const sag = R * (0.04 + 0.03 * ((k + i) % 3));
      const c1x = sx + sway;
      const c1y = mix(y0, ey, 0.33) + sag;
      const c2x = ex - sway;
      const c2y = mix(y0, ey, 0.66) + sag;
      const base = (R * 0.05 * (1 - Math.abs(f))) / (1 + stretch * 0.6);
      const thin = Math.max(0.6, base * 0.18);
      // sample the curve and build a tapered ribbon
      const N = 22;
      const left: [number, number][] = [];
      const right: [number, number][] = [];
      for (let n = 0; n <= N; n++) {
        const t = n / N;
        const mt = 1 - t;
        const x = mt * mt * mt * sx + 3 * mt * mt * t * c1x + 3 * mt * t * t * c2x + t * t * t * ex;
        const y = mt * mt * mt * y0 + 3 * mt * mt * t * c1y + 3 * mt * t * t * c2y + t * t * t * ey;
        const dx = 3 * mt * mt * (c1x - sx) + 6 * mt * t * (c2x - c1x) + 3 * t * t * (ex - c2x);
        const dy = 3 * mt * mt * (c1y - y0) + 6 * mt * t * (c2y - c1y) + 3 * t * t * (ey - c2y);
        const len = Math.hypot(dx, dy) || 1;
        // wide at both ends, thin in the middle
        const half = (thin + (base - thin) * Math.pow(Math.abs(t - 0.5) * 2, 2.2)) / 2;
        left.push([x - (dy / len) * half, y + (dx / len) * half]);
        right.push([x + (dy / len) * half, y - (dx / len) * half]);
      }
      const g = ctx!.createLinearGradient(sx, y0, ex, ey);
      g.addColorStop(0, 'rgb(240 214 160)');
      g.addColorStop(0.5, 'rgb(255 247 226)');
      g.addColorStop(1, 'rgb(248 234 200)');
      ctx!.globalAlpha = clamp(lift * 2) * 0.95;
      // thin warm outline underneath, so the strings read on the light background
      ctx!.strokeStyle = 'rgb(176 120 60 / 0.45)';
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.moveTo(left[0][0], left[0][1]);
      left.forEach(([x, y]) => ctx!.lineTo(x, y));
      for (let n = right.length - 1; n >= 0; n--) ctx!.lineTo(right[n][0], right[n][1]);
      ctx!.closePath();
      ctx!.stroke();
      ctx!.fillStyle = g;
      ctx!.beginPath();
      ctx!.moveTo(left[0][0], left[0][1]);
      left.forEach(([x, y]) => ctx!.lineTo(x, y));
      for (let n = right.length - 1; n >= 0; n--) ctx!.lineTo(right[n][0], right[n][1]);
      ctx!.closePath();
      ctx!.fill();
      ctx!.globalAlpha = 1;
    });
  }

  function render(p: number, time: number) {
    const { cx, cy, R, lift } = geometry();
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.clearRect(0, 0, w, h);

    const rise = easeOut(seg(p, 0.08, 0.5));
    const fall = easeIn(seg(p, 0.72, 0.96));
    const air = rise * (1 - fall);

    // Warm light from below, stronger while the toppings are in the air
    const glow = ctx!.createRadialGradient(cx, cy, R * 0.4, cx, cy, R * 2.4);
    glow.addColorStop(0, `rgb(232 130 60 / ${0.1 + 0.14 * air})`);
    glow.addColorStop(1, 'rgb(232 110 40 / 0)');
    ctx!.fillStyle = glow;
    ctx!.fillRect(0, 0, w, h);

    // Steam above the hot pizza
    for (let s = 0; s < 3; s++) {
      const t = (time * 0.05 + s / 3) % 1;
      const sx = cx + Math.sin(time * 0.4 + s * 2) * R * 0.25 + (s - 1) * R * 0.3;
      const sy = cy - R * 0.4 - t * R * 1.4;
      const sr = R * (0.35 + t * 0.5);
      const sg = ctx!.createRadialGradient(sx, sy, 0, sx, sy, sr);
      sg.addColorStop(0, `rgb(255 255 255 / ${0.35 * Math.sin(Math.PI * t) * (1 - air * 0.5)})`);
      sg.addColorStop(1, 'rgb(255 255 255 / 0)');
      ctx!.fillStyle = sg;
      ctx!.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
    }

    // Shadow and the pizza itself
    ctx!.save();
    ctx!.translate(cx + R * 0.03, cy + R * 0.12);
    ctx!.scale(1, 0.88);
    const shadow = ctx!.createRadialGradient(0, 0, R * 0.7, 0, 0, R * 1.12);
    shadow.addColorStop(0, 'rgb(60 30 10 / 0.28)');
    shadow.addColorStop(1, 'rgb(60 30 10 / 0)');
    ctx!.fillStyle = shadow;
    ctx!.fillRect(-R * 1.2, -R * 1.2, R * 2.4, R * 2.4);
    ctx!.restore();
    drawImg('pizza', cx, cy, R * 2, -0.2 + p * 0.45);

    // Embers and flour, pushed up as the toppings burst off
    motes.forEach((m, i) => {
      const drift = ((time * 0.04 * m.speed + p * 0.6 * m.speed + i * 0.13) % 1) * 1.8;
      const x = cx + (m.x + Math.sin(time * 0.5 + m.phase) * 0.05) * R;
      const y = cy + (m.y + 0.6 - drift) * R;
      const a = Math.sin(Math.PI * (drift / 1.8)) * (m.ember ? 0.55 + 0.4 * air : 0.25 + 0.3 * air);
      ctx!.fillStyle = m.ember ? `rgb(214 104 44 / ${a})` : `rgb(201 139 74 / ${a * 0.8})`;
      ctx!.beginPath();
      ctx!.arc(x, y, m.r * (R / 300), 0, Math.PI * 2);
      ctx!.fill();
    });

    // Toppings: cheese first (with its strings), basil on top
    const order = [...PIECES.keys()].sort((a, b) => Number(PIECES[a].kind === 'basil') - Number(PIECES[b].kind === 'basil'));
    order.forEach((i) => {
      const pc = PIECES[i];
      const own = clamp((air - pc.delay * 0.5) / (1 - pc.delay * 0.5));
      if (own <= 0) return;
      const t = easeOut(own);
      const float = Math.sin(time * 1.3 + i * 1.9) * R * 0.035 * t;
      const x0 = cx + pc.from[0] * R;
      const y0 = cy + pc.from[1] * R;
      const x = mix(x0, cx + pc.to[0] * R * mix(1, 0.9, 1 - lift), t);
      const y = mix(y0, cy + pc.to[1] * R * lift, t) + float;
      const width = pc.size * R * mix(0.85, 1, t);
      const rot = mix(pc.rot[0], pc.rot[1], t) + Math.sin(time * 0.9 + i) * 0.06 * t;
      if (pc.kind === 'cheese') cheeseStrings(x0, y0, x, y, width, t, R, i, time);
      drawImg(pc.src, x, y, width, rot, clamp(t * 3));
    });
  }

  const start = performance.now();
  const now = () => (opts.reduced ? 2 : (performance.now() - start) / 1000);

  function readProgress() {
    const rect = hero!.getBoundingClientRect();
    const scrollable = rect.height - window.innerHeight;
    return scrollable > 0 ? clamp(-rect.top / scrollable) : 0;
  }

  function tick() {
    raf = 0;
    target = readProgress();
    current += (target - current) * 0.12;
    if (Math.abs(target - current) < 0.0005) current = target;
    render(current, now());
    if (visible) raf = requestAnimationFrame(tick);
  }

  layout();
  Promise.all(SOURCES.map(load)).then(() => {
    if (opts.reduced) render(0.6, now());
    else {
      current = target = readProgress();
      if (!raf && visible) raf = requestAnimationFrame(tick);
    }
  });

  if (!opts.reduced) {
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    }).observe(hero);
  }

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      layout();
      render(current, now());
    }, 120);
  });
}
