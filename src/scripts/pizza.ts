/**
 * Main animation: a real Neapolitan pizza (photo cut-out) brought to life as the visitor scrolls.
 *
 * The hero has a sticky stage; scroll progress (0 → 1) through the hero drives every stage:
 *   0.00–0.16  the pizza opens up from the centre, turning, like dough being stretched
 *   0.16–0.68  colour spreads out from the centre: tomato, mozzarella and basil come to life
 *   0.68–0.86  into the oven: warm glow behind it and a golden sheen on top
 *   0.86–1.00  sliced, one slice pulled away with strings of cheese
 *
 * Two versions of the same photo are used (public/img): the finished pizza and a pale,
 * "raw" one. Progress is smoothed (lerp) so the movement never looks stepped; drawing only
 * happens while the hero is on screen and the progress changes. With reduced motion the
 * finished pizza is drawn once and nothing moves by itself.
 */

type Rand = () => number;
const seeded = (seed: number): Rand => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
/** Local 0..1 progress inside [a, b] */
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const STAGES = [0, 0.16, 0.36, 0.54, 0.68, 0.86];

const rand = seeded(7);
const flour = Array.from({ length: 70 }, () => ({ a: rand() * Math.PI * 2, d: 0.9 + rand() * 0.55, r: 0.6 + rand() * 1.6, o: 0.15 + rand() * 0.35 }));

interface Pics {
  cooked: HTMLImageElement;
  raw: HTMLImageElement;
}
let pics: Pics | null = null;

/** Draws the pizza centred at 0,0, R = half its width, for progress p */
function drawPizza(ctx: CanvasRenderingContext2D, R: number, p: number) {
  if (!pics) return;
  const open = easeOut(seg(p, 0, STAGES[1]));
  const colourT = easeInOut(seg(p, STAGES[1], STAGES[4]));
  const bake = easeInOut(seg(p, STAGES[4], STAGES[5]));
  const r = R * mix(0.5, 1, open);

  // Shadow under the pizza
  ctx.save();
  ctx.fillStyle = 'rgb(60 30 10 / 0.16)';
  ctx.beginPath();
  ctx.ellipse(r * 0.04, r * 0.07, r * 0.98, r * 0.88, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Pale, "raw" pizza underneath
  if (colourT < 1) ctx.drawImage(pics.raw, -r, -r, r * 2, r * 2);

  // Colour spreads from the centre with a wavy, sauce-like edge
  if (colourT > 0) {
    ctx.save();
    if (colourT < 1) {
      const reach = r * 1.15 * colourT;
      ctx.beginPath();
      const n = 64;
      for (let i = 0; i <= n; i++) {
        const a = (i / n) * Math.PI * 2;
        const rr = reach * (1 + 0.06 * Math.sin(5 * a + colourT * 6) + 0.04 * Math.sin(9 * a + 1.3));
        if (i === 0) ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
        else ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      ctx.closePath();
      ctx.clip();
    }
    ctx.drawImage(pics.cooked, -r, -r, r * 2, r * 2);
    ctx.restore();
  }

  // Golden sheen from the oven, only on the pizza
  const sheen = Math.sin(Math.PI * clamp(bake)) * 0.9;
  if (sheen > 0.01) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    const g = ctx.createRadialGradient(-r * 0.3, -r * 0.35, 0, 0, 0, r * 1.1);
    g.addColorStop(0, `rgb(255 200 120 / ${0.28 * sheen})`);
    g.addColorStop(1, `rgb(255 140 60 / ${0.12 * sheen})`);
    ctx.fillStyle = g;
    ctx.fillRect(-r * 1.1, -r * 1.1, r * 2.2, r * 2.2);
    ctx.restore();
  }
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function initPizza(opts: { reduced: boolean }) {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-pizza]');
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!canvas || !hero) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const stepEls = [...hero.querySelectorAll<HTMLElement>('[data-step]')];

  let w = 0;
  let h = 0;
  let dpr = 1;
  let target = opts.reduced ? 1 : 0;
  let current = target;
  let drawn = -1;
  let visible = true;
  let raf = 0;
  let activeStep = -1;

  function layout() {
    const rect = canvas!.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    // Retina sharpness, capped at 2 so phones are not asked to fill huge canvases
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas!.width = Math.round(w * dpr);
    canvas!.height = Math.round(h * dpr);
    drawn = -1;
  }

  function geometry() {
    const wide = w >= 900;
    if (wide) return { cx: w * 0.7, cy: h * 0.54, R: Math.min(w * 0.24, h * 0.36) };
    return { cx: w * 0.56, cy: h * 0.8, R: Math.min(w * 0.5, h * 0.25) };
  }

  // Offscreen layer: the pizza is composed here so the oven sheen only touches the pizza
  const layer = document.createElement('canvas');
  const lctx = layer.getContext('2d')!;

  function pizzaLayer(R: number, p: number) {
    const size = Math.ceil(R * 2.5 * dpr);
    if (layer.width !== size) {
      layer.width = size;
      layer.height = size;
    }
    lctx.setTransform(1, 0, 0, 1, 0, 0);
    lctx.clearRect(0, 0, size, size);
    lctx.setTransform(dpr, 0, 0, dpr, size / 2, size / 2);
    drawPizza(lctx, R, p);
    return size / dpr;
  }

  function render(p: number) {
    const { cx, cy, R } = geometry();
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.clearRect(0, 0, w, h);

    const bake = easeInOut(seg(p, STAGES[4], STAGES[5]));
    // Oven glow behind the pizza while it bakes
    const glow = Math.sin(Math.PI * clamp(bake * 1.15)) * 0.9 + (p >= STAGES[5] ? 0.15 : 0);
    if (glow > 0.01) {
      const g = ctx!.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.9);
      g.addColorStop(0, `rgb(240 120 40 / ${0.38 * glow})`);
      g.addColorStop(1, 'rgb(240 120 40 / 0)');
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, w, h);
    }

    // Flour dusting on the bench, fading out as the dough is stretched
    const flourT = 1 - seg(p, 0.1, 0.4);
    if (flourT > 0) {
      flour.forEach((f) => {
        ctx!.fillStyle = `rgb(255 252 244 / ${f.o * flourT})`;
        ctx!.beginPath();
        ctx!.arc(cx + Math.cos(f.a) * f.d * R, cy + Math.sin(f.a) * f.d * R, f.r * (R / 160), 0, Math.PI * 2);
        ctx!.fill();
      });
    }

    const rot = -0.6 + p * 0.9; // the pizza turns, like on the peel in the oven
    const box = pizzaLayer(R, p);
    const drawLayer = () => ctx!.drawImage(layer, -box / 2, -box / 2, box, box);
    const sliceT = easeInOut(seg(p, STAGES[5], 1));

    if (sliceT <= 0) {
      ctx!.save();
      ctx!.translate(cx, cy);
      ctx!.rotate(rot);
      drawLayer();
      ctx!.restore();
      return;
    }

    // Sliced: 6 slices, one pulled out with strings of cheese
    const N = 6;
    const half = Math.PI / N;
    const pullAngle = -0.35; // direction the slice moves, in screen space: to the right, slightly up
    const pull = R * 0.22 * sliceT;
    const clipWedge = (a0: number, a1: number) => {
      ctx!.beginPath();
      ctx!.moveTo(0, 0);
      ctx!.arc(0, 0, R * 1.2, a0, a1);
      ctx!.closePath();
    };

    // Rest of the pizza
    ctx!.save();
    ctx!.translate(cx, cy);
    ctx!.rotate(rot);
    const localPull = pullAngle - rot;
    ctx!.save();
    clipWedge(localPull + half, localPull - half + Math.PI * 2);
    ctx!.clip();
    drawLayer();
    ctx!.restore();

    // Cut lines
    ctx!.strokeStyle = `rgb(120 60 24 / ${0.45 * sliceT})`;
    ctx!.lineWidth = Math.max(1, R * 0.008);
    for (let i = 0; i < N; i++) {
      const a = localPull + half + (i * Math.PI * 2) / N;
      const len = R * 0.9 * clamp(sliceT * 1.6 - i * 0.08);
      ctx!.beginPath();
      ctx!.moveTo(0, 0);
      ctx!.lineTo(Math.cos(a) * len, Math.sin(a) * len);
      ctx!.stroke();
    }

    // Cheese strings bridging the gap
    const ox = Math.cos(localPull) * pull;
    const oy = Math.sin(localPull) * pull;
    const strings = 5;
    for (let i = 0; i < strings; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const a = localPull + side * half;
      const d = R * (0.18 + i * 0.13);
      const x1 = Math.cos(a) * d;
      const y1 = Math.sin(a) * d;
      const thin = 1 - sliceT * 0.7;
      ctx!.strokeStyle = `rgb(250 240 214 / ${0.9 * (1 - Math.pow(sliceT, 4) * 0.6)})`;
      ctx!.lineWidth = Math.max(0.8, R * 0.022 * thin);
      ctx!.beginPath();
      ctx!.moveTo(x1, y1);
      ctx!.quadraticCurveTo(x1 + ox * 0.5, y1 + oy * 0.5 + R * 0.04 * sliceT, x1 + ox, y1 + oy);
      ctx!.stroke();
    }

    // The pulled slice
    ctx!.translate(ox, oy);
    ctx!.save();
    clipWedge(localPull - half, localPull + half);
    ctx!.clip();
    drawLayer();
    ctx!.restore();
    ctx!.restore();
  }

  function setStep(p: number) {
    let idx = 0;
    STAGES.forEach((s, i) => {
      if (p >= s - 0.005) idx = i;
    });
    if (idx === activeStep) return;
    activeStep = idx;
    stepEls.forEach((el, i) => el.classList.toggle('is-active', i === idx));
  }

  function readProgress() {
    const rect = hero!.getBoundingClientRect();
    const scrollable = rect.height - window.innerHeight;
    return scrollable > 0 ? clamp(-rect.top / scrollable) : 0;
  }

  function tick() {
    raf = 0;
    if (!opts.reduced) target = readProgress();
    // Smoothing: close 14% of the gap each frame
    current += (target - current) * 0.14;
    if (Math.abs(target - current) < 0.0005) current = target;
    if (Math.abs(current - drawn) > 0.0003) {
      render(current);
      drawn = current;
      setStep(current);
    }
    if (visible && !opts.reduced && current !== target) raf = requestAnimationFrame(tick);
  }
  const wake = () => {
    if (!raf && visible) raf = requestAnimationFrame(tick);
  };

  layout();
  Promise.all([loadImage('/img/hero-pizza.webp'), loadImage('/img/hero-pizza-raw.webp')])
    .then(([cooked, raw]) => {
      pics = { cooked, raw };
      render(current);
      drawn = current;
    })
    .catch(() => {});
  if (opts.reduced) {
    // Finished pizza, no motion
    render(1);
    setStep(1);
  } else {
    current = target = readProgress();
    render(current);
    drawn = current;
    setStep(current);
    window.addEventListener('scroll', wake, { passive: true });
  }

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) wake();
  }).observe(hero);

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      layout();
      render(current);
      drawn = current;
    }, 120);
  });
}
