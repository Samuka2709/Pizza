/**
 * Main animation: a Neapolitan pizza built as the visitor scrolls through the hero.
 *
 * The hero has a sticky stage; scroll progress (0 → 1) through the hero drives every stage:
 *   0.00–0.16  dough ball stretched into a disc
 *   0.16–0.36  tomato spooned in a spiral from the centre
 *   0.36–0.54  torn mozzarella dropped on
 *   0.54–0.68  basil leaves and a thread of olive oil
 *   0.68–0.86  into the oven: crust browns, leopard spots, cheese melts, glow
 *   0.86–1.00  sliced, one slice pulled away with a cheese stretch
 *
 * Progress is smoothed (lerp) so the movement never looks stepped. Drawing only happens
 * while the hero is on screen and the progress actually changes. With reduced motion
 * the finished pizza is drawn once and nothing moves by itself.
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
function mixColor(c1: [number, number, number], c2: [number, number, number], t: number) {
  return `rgb(${Math.round(mix(c1[0], c2[0], t))} ${Math.round(mix(c1[1], c2[1], t))} ${Math.round(mix(c1[2], c2[2], t))})`;
}

const STAGES = [0, 0.16, 0.36, 0.54, 0.68, 0.86];

// Toppings are placed once, with a fixed seed: the same pizza every visit
const rand = seeded(7);
const cheese = Array.from({ length: 10 }, (_, i) => {
  const a = (i / 10) * Math.PI * 2 + rand() * 0.5;
  const d = i % 3 === 0 ? 0.18 + rand() * 0.12 : 0.42 + rand() * 0.2;
  return { a, d, r: 0.1 + rand() * 0.05, wob: rand() * 10, delay: rand() * 0.55, rot: rand() * Math.PI };
});
const basil = Array.from({ length: 5 }, (_, i) => {
  const a = (i / 5) * Math.PI * 2 + 0.6 + rand() * 0.4;
  return { a, d: 0.3 + rand() * 0.3, size: 0.12 + rand() * 0.03, rot: rand() * Math.PI * 2, delay: rand() * 0.5 };
});
const spots = Array.from({ length: 46 }, () => {
  const a = rand() * Math.PI * 2;
  const onRim = rand() < 0.7;
  return { a, d: onRim ? 0.88 + rand() * 0.1 : rand() * 0.8, r: 0.008 + rand() * 0.022, delay: rand() * 0.6 };
});
const sauceFlecks = Array.from({ length: 26 }, () => ({ a: rand() * Math.PI * 2, d: rand() * 0.78, r: 0.02 + rand() * 0.04 }));
const flour = Array.from({ length: 70 }, () => ({ a: rand() * Math.PI * 2, d: 0.9 + rand() * 0.55, r: 0.6 + rand() * 1.6, o: 0.15 + rand() * 0.35 }));

/** Radius of the dough edge at angle a (slightly irregular, hand-stretched) */
const edge = (a: number, wobble: number) => 1 + wobble * (0.022 * Math.sin(5 * a + 1) + 0.014 * Math.sin(9 * a + 2.4) + 0.01 * Math.sin(13 * a));

function blobPath(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, wob: number, rot: number) {
  ctx.beginPath();
  const n = 18;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (1 + 0.16 * Math.sin(3 * a + wob) + 0.08 * Math.sin(5 * a + wob * 2));
    const px = x + Math.cos(a + rot) * rr;
    const py = y + Math.sin(a + rot) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function leaf(ctx: CanvasRenderingContext2D, size: number, bake: number) {
  const g = ctx.createLinearGradient(-size, 0, size, 0);
  g.addColorStop(0, mixColor([46, 104, 44], [38, 70, 32], bake));
  g.addColorStop(1, mixColor([88, 150, 64], [60, 98, 44], bake));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-size, 0);
  ctx.bezierCurveTo(-size * 0.4, -size * 0.62, size * 0.5, -size * 0.55, size, 0);
  ctx.bezierCurveTo(size * 0.5, size * 0.55, -size * 0.4, size * 0.62, -size, 0);
  ctx.fill();
  ctx.strokeStyle = 'rgb(220 240 200 / 0.35)';
  ctx.lineWidth = Math.max(1, size * 0.04);
  ctx.beginPath();
  ctx.moveTo(-size * 0.9, 0);
  ctx.quadraticCurveTo(0, -size * 0.06, size * 0.85, 0);
  ctx.stroke();
}

/** Draws the whole pizza centred at 0,0 with radius R for progress p */
function drawPizza(ctx: CanvasRenderingContext2D, R: number, p: number) {
  const stretch = easeOut(seg(p, 0, STAGES[1]));
  const sauceT = seg(p, STAGES[1], STAGES[2]);
  const cheeseT = seg(p, STAGES[2], STAGES[3]);
  const basilT = seg(p, STAGES[3], STAGES[4]);
  const bake = easeInOut(seg(p, STAGES[4], STAGES[5]));

  // Dough: from a ball (small, thick) to a hand-stretched disc
  const scale = mix(0.42, 1, stretch);
  const r = R * scale;
  const wobble = mix(0.3, 1, stretch);

  // Shadow under the dough
  ctx.save();
  ctx.fillStyle = 'rgb(60 30 10 / 0.16)';
  ctx.beginPath();
  ctx.ellipse(r * 0.04, r * 0.08, r * 1.02, r * 1.0, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const doughPath = () => {
    ctx.beginPath();
    const n = 72;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rr = r * edge(a, wobble);
      if (i === 0) ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
      else ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.closePath();
  };

  const dg = ctx.createRadialGradient(-r * 0.25, -r * 0.3, r * 0.1, 0, 0, r * 1.05);
  dg.addColorStop(0, mixColor([246, 226, 190], [236, 200, 140], bake));
  dg.addColorStop(0.78, mixColor([236, 208, 160], [214, 160, 92], bake));
  dg.addColorStop(1, mixColor([222, 188, 136], [170, 104, 50], bake));
  ctx.fillStyle = dg;
  doughPath();
  ctx.fill();

  // Cornicione highlight (puffed rim)
  const rimIn = 0.86;
  ctx.save();
  doughPath();
  ctx.clip();
  const rg = ctx.createRadialGradient(0, 0, r * rimIn * 0.96, 0, 0, r);
  rg.addColorStop(0, 'rgb(255 255 255 / 0)');
  rg.addColorStop(0.45, `rgb(255 244 220 / ${0.35 * (1 - bake * 0.6)})`);
  rg.addColorStop(1, `rgb(120 70 30 / ${0.1 + bake * 0.35})`);
  ctx.fillStyle = rg;
  ctx.fillRect(-r * 1.2, -r * 1.2, r * 2.4, r * 2.4);
  ctx.restore();

  const inner = r * 0.82;

  // Tomato: a spiral from the centre outwards, like the back of a ladle
  if (sauceT > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, inner, 0, Math.PI * 2);
    ctx.clip();
    const sauce = mixColor([196, 52, 30], [168, 40, 24], bake);
    ctx.strokeStyle = sauce;
    ctx.fillStyle = sauce;
    ctx.lineCap = 'round';
    const turns = 3.4;
    const width = (inner / turns) * 1.35;
    ctx.lineWidth = width;
    const total = turns * Math.PI * 2;
    const end = easeInOut(sauceT) * total;
    ctx.beginPath();
    for (let t = 0; t <= end; t += 0.08) {
      const rr = (t / total) * inner;
      const x = Math.cos(t) * rr;
      const y = Math.sin(t) * rr;
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    if (sauceT >= 1) {
      ctx.beginPath();
      ctx.arc(0, 0, inner, 0, Math.PI * 2);
      ctx.fill();
    }
    // Lighter flecks of tomato
    ctx.fillStyle = `rgb(232 104 64 / ${0.35 * sauceT})`;
    sauceFlecks.forEach((f) => {
      if (f.d * inner > (end / total) * inner) return;
      ctx.beginPath();
      ctx.arc(Math.cos(f.a) * f.d * inner, Math.sin(f.a) * f.d * inner, f.r * r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  // Mozzarella: torn pieces that drop in, then melt and colour in the oven
  if (cheeseT > 0) {
    cheese.forEach((c) => {
      const t = easeOut(seg(cheeseT, c.delay * 0.7, c.delay * 0.7 + 0.45));
      if (t <= 0) return;
      const x = Math.cos(c.a) * c.d * inner;
      const y = Math.sin(c.a) * c.d * inner - (1 - t) * R * 0.25;
      const rr = c.r * R * mix(1.35, 1, t) * (1 + bake * 0.28);
      ctx.save();
      ctx.globalAlpha = t;
      ctx.fillStyle = 'rgb(120 40 20 / 0.18)';
      blobPath(ctx, x + rr * 0.08, y + rr * 0.12, rr, c.wob, c.rot);
      ctx.fill();
      const cg = ctx.createRadialGradient(x - rr * 0.3, y - rr * 0.3, rr * 0.1, x, y, rr);
      cg.addColorStop(0, 'rgb(255 253 246)');
      cg.addColorStop(1, mixColor([244, 236, 216], [240, 214, 160], bake));
      ctx.fillStyle = cg;
      blobPath(ctx, x, y, rr, c.wob, c.rot);
      ctx.fill();
      // golden blisters
      if (bake > 0.3) {
        ctx.fillStyle = `rgb(206 140 60 / ${(bake - 0.3) * 0.7})`;
        for (let k = 0; k < 3; k++) {
          const ka = c.wob + k * 2.1;
          ctx.beginPath();
          ctx.arc(x + Math.cos(ka) * rr * 0.45, y + Math.sin(ka) * rr * 0.45, rr * 0.16, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    });
  }

  // Basil leaves float down and settle; then a thread of olive oil
  if (basilT > 0) {
    basil.forEach((b) => {
      const t = easeOut(seg(basilT, b.delay * 0.6, b.delay * 0.6 + 0.5));
      if (t <= 0) return;
      ctx.save();
      ctx.globalAlpha = t;
      ctx.translate(Math.cos(b.a) * b.d * inner, Math.sin(b.a) * b.d * inner - (1 - t) * R * 0.35);
      ctx.rotate(b.rot + (1 - t) * 1.8);
      leaf(ctx, b.size * R * (1 - bake * 0.12), bake);
      ctx.restore();
    });
    const oil = seg(basilT, 0.45, 1);
    if (oil > 0) {
      ctx.save();
      ctx.strokeStyle = `rgb(222 180 60 / ${0.55 * (1 - bake * 0.5)})`;
      ctx.lineWidth = Math.max(1.5, R * 0.012);
      ctx.lineCap = 'round';
      ctx.beginPath();
      const end = oil * Math.PI * 4.2;
      for (let t = 0; t <= end; t += 0.05) {
        const rr = inner * (0.12 + (t / (Math.PI * 4.2)) * 0.6);
        const x = Math.cos(t * 1.1 + 0.4) * rr;
        const y = Math.sin(t * 1.1 + 0.4) * rr * 0.92;
        if (t === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  // Leopard spotting from the oven
  if (bake > 0) {
    spots.forEach((s) => {
      const t = seg(bake, s.delay * 0.6, s.delay * 0.6 + 0.4);
      if (t <= 0) return;
      const d = s.d * (s.d > 0.85 ? r * edge(s.a, wobble) : inner);
      ctx.fillStyle = `rgb(48 26 14 / ${0.75 * t})`;
      ctx.beginPath();
      ctx.arc(Math.cos(s.a) * d, Math.sin(s.a) * d, s.r * R, 0, Math.PI * 2);
      ctx.fill();
    });
  }
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

    const rot = -0.25 + p * 0.9; // the pizza turns, like on the peel in the oven
    const sliceT = easeInOut(seg(p, STAGES[5], 1));

    if (sliceT <= 0) {
      ctx!.save();
      ctx!.translate(cx, cy);
      ctx!.rotate(rot);
      drawPizza(ctx!, R, p);
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
    drawPizza(ctx!, R, p);
    ctx!.restore();

    // Cut lines
    ctx!.strokeStyle = `rgb(120 60 24 / ${0.45 * sliceT})`;
    ctx!.lineWidth = Math.max(1, R * 0.008);
    for (let i = 0; i < N; i++) {
      const a = localPull + half + (i * Math.PI * 2) / N;
      const len = R * 0.98 * clamp(sliceT * 1.6 - i * 0.08);
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
    drawPizza(ctx!, R, p);
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
