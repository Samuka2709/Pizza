/**
 * "Gire a pizza" (home): a pizza drawn once in an offscreen canvas, one flavour per slice.
 * The section is pinned; each slice of scroll turns the pizza by one slice and swaps the
 * flavour text. Rotation is smoothed; with reduced motion it jumps straight to the slice.
 * Click a slice, a name around the pizza or a dot to go to that flavour.
 * Drawing based on the "Accueil/{pizza}" frame of the Figma Pizzeria Website (Community).
 */
interface Flavor {
  name: string;
  short: string;
  priceLabel: string;
  order: string;
  base: 'tomato' | 'cream';
  desc: string[];
  ing: [string, string][];
  garnish: [string, number][];
}

type G = CanvasRenderingContext2D;
type Rnd = () => number;

function rng(seed: number): Rnd {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function blob(g: G, x: number, y: number, r: number, col: string, rnd: Rnd, pts = 9) {
  g.beginPath();
  for (let k = 0; k <= pts; k++) {
    const a = (k / pts) * Math.PI * 2;
    const rr = r * (0.75 + rnd() * 0.45);
    const px = x + Math.cos(a) * rr;
    const py = y + Math.sin(a) * rr;
    if (k) g.lineTo(px, py);
    else g.moveTo(px, py);
  }
  g.closePath();
  g.fillStyle = col;
  g.fill();
}

function roundRect(g: G, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

const GARNISH: Record<string, (g: G, s: number, r: Rnd) => void> = {
  jambon(g, s) { g.fillStyle = '#e48a92'; roundRect(g, -s * 1.1, -s * 0.7, s * 2.2, s * 1.4, s * 0.35); g.fill(); g.fillStyle = 'rgba(255,220,225,.6)'; roundRect(g, -s * 0.8, -s * 0.45, s * 1.2, s * 0.35, s * 0.15); g.fill(); },
  ananas(g, s) { g.fillStyle = '#f2cc4a'; g.beginPath(); g.moveTo(-s * 0.9, -s * 0.6); g.lineTo(s * 0.9, -s * 0.6); g.lineTo(s * 0.55, s * 0.7); g.lineTo(-s * 0.55, s * 0.7); g.closePath(); g.fill(); g.fillStyle = '#f8e18a'; g.fillRect(-s * 0.6, -s * 0.45, s * 1.2, s * 0.25); },
  mozza(g, s, r) { blob(g, 0, 0, s * 1.4, '#fbf7ec', r, 11); blob(g, -s * 0.2, -s * 0.2, s * 0.8, '#ffffff', r, 9); },
  basilic(g, s) { g.fillStyle = '#2f7a26'; g.beginPath(); g.ellipse(0, 0, s * 1.3, s * 0.6, 0, 0, 7); g.fill(); g.strokeStyle = '#5aa646'; g.lineWidth = 2; g.beginPath(); g.moveTo(-s * 1.1, 0); g.lineTo(s * 1.1, 0); g.stroke(); },
  chevre(g, s) { g.fillStyle = '#f6f2e9'; g.beginPath(); g.arc(0, 0, s * 1.2, 0, 7); g.fill(); g.strokeStyle = '#e2dccd'; g.lineWidth = 4; g.stroke(); g.fillStyle = '#fffdf7'; g.beginPath(); g.arc(0, 0, s * 0.75, 0, 7); g.fill(); },
  bleu(g, s, r) { blob(g, 0, 0, s * 1.1, '#efe9da', r); for (let k = 0; k < 5; k++) { g.fillStyle = '#6f8fa8'; g.beginPath(); g.arc((r() - 0.5) * s * 1.2, (r() - 0.5) * s * 1.2, s * 0.15, 0, 7); g.fill(); } },
  emmental(g, s, r) { blob(g, 0, 0, s * 1.2, '#f3d36f', r); g.fillStyle = '#e2b94b'; g.beginPath(); g.arc(s * 0.3, -s * 0.2, s * 0.22, 0, 7); g.fill(); g.beginPath(); g.arc(-s * 0.35, s * 0.3, s * 0.16, 0, 7); g.fill(); },
  poivron(g, s, r) { const col = r() > 0.5 ? '#d8432b' : r() > 0.5 ? '#f2b632' : '#3d8b37'; g.strokeStyle = col; g.lineWidth = s * 0.45; g.lineCap = 'round'; g.beginPath(); g.arc(0, s * 0.9, s * 1.3, -2.3, -0.8); g.stroke(); },
  champi(g, s) { g.fillStyle = '#e9dcc8'; g.beginPath(); g.arc(0, 0, s * 1.05, Math.PI, 0); g.quadraticCurveTo(s * 0.6, s * 0.25, s * 0.35, s * 0.25); g.lineTo(s * 0.35, s * 0.95); g.lineTo(-s * 0.35, s * 0.95); g.lineTo(-s * 0.35, s * 0.25); g.quadraticCurveTo(-s * 0.6, s * 0.25, -s * 1.05, 0); g.fill(); g.strokeStyle = '#a88866'; g.lineWidth = 2.5; g.stroke(); },
  olive(g, s) { g.strokeStyle = '#262626'; g.lineWidth = s * 0.45; g.beginPath(); g.arc(0, 0, s * 0.55, 0, 7); g.stroke(); g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, s * 0.7, -2, -1.2); g.stroke(); },
  saumon(g, s) { g.strokeStyle = '#ef8466'; g.lineWidth = s * 0.7; g.lineCap = 'round'; g.beginPath(); g.moveTo(-s * 1.2, 0); g.bezierCurveTo(-s * 0.4, -s * 0.7, s * 0.4, s * 0.7, s * 1.2, 0); g.stroke(); g.strokeStyle = 'rgba(255,225,210,.7)'; g.lineWidth = s * 0.12; g.stroke(); },
  aneth(g, s) { g.strokeStyle = '#5f9e46'; g.lineWidth = 2.2; g.beginPath(); for (let k = 0; k < 4; k++) { const a = k * 1.6; g.moveTo(0, 0); g.lineTo(Math.cos(a) * s * 0.8, Math.sin(a) * s * 0.8); } g.stroke(); },
  oeuf(g, s, r) { blob(g, 0, 0, s * 1.3, '#fbf8f0', r, 10); g.fillStyle = '#f2b632'; g.beginPath(); g.arc(s * 0.1, -s * 0.05, s * 0.5, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.arc(-s * 0.05, -s * 0.2, s * 0.15, 0, 7); g.fill(); },
  frango(g, s) { g.strokeStyle = '#d6b17f'; g.lineWidth = s * 0.32; g.lineCap = 'round'; g.beginPath(); g.moveTo(-s, 0); g.quadraticCurveTo(0, -s * 0.5, s, s * 0.1); g.stroke(); g.strokeStyle = '#ecd2a6'; g.lineWidth = s * 0.12; g.stroke(); },
  catupiry(g, s, r) { blob(g, 0, 0, s * 1.4, '#fcfaf3', r, 12); g.strokeStyle = 'rgba(220,210,190,.8)'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, s * 0.7, 0, 4.5); g.stroke(); },
  milho(g, s) { g.fillStyle = '#f2c230'; g.beginPath(); g.ellipse(0, 0, s * 0.45, s * 0.35, 0, 0, 7); g.fill(); g.fillStyle = '#f9dc6a'; g.beginPath(); g.ellipse(-s * 0.1, -s * 0.08, s * 0.2, s * 0.14, 0, 0, 7); g.fill(); },
  citron(g, s) { g.fillStyle = '#f1d74b'; g.beginPath(); g.arc(0, 0, s * 1.5, 0, 7); g.fill(); g.fillStyle = '#fbeb98'; g.beginPath(); g.arc(0, 0, s * 1.25, 0, 7); g.fill(); g.strokeStyle = '#f1d74b'; g.lineWidth = 2; g.beginPath(); for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4; g.moveTo(0, 0); g.lineTo(Math.cos(a) * s * 1.25, Math.sin(a) * s * 1.25); } g.stroke(); },
  chorizo(g, s, r) { g.fillStyle = '#a8241b'; g.beginPath(); g.arc(0, 0, s * 1.05, 0, 7); g.fill(); g.fillStyle = '#c73a2c'; g.beginPath(); g.arc(-s * 0.1, -s * 0.1, s * 0.8, 0, 7); g.fill(); for (let k = 0; k < 5; k++) { g.fillStyle = 'rgba(255,225,215,.8)'; g.beginPath(); g.arc((r() - 0.5) * s * 1.1, (r() - 0.5) * s * 1.1, s * 0.1, 0, 7); g.fill(); } },
  oignon(g, s) { g.strokeStyle = '#a5679a'; g.lineWidth = 3.5; g.beginPath(); g.arc(0, 0, s * 1.1, -0.4, 2.4); g.stroke(); g.strokeStyle = '#e8d3e2'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, s * 0.8, -0.2, 2.2); g.stroke(); },
};
const SIZE: Record<string, number> = { jambon: 24, ananas: 22, mozza: 26, basilic: 22, chevre: 28, bleu: 28, emmental: 28, poivron: 22, champi: 24, oeuf: 26, frango: 20, catupiry: 26, milho: 14, olive: 16, saumon: 28, aneth: 18, citron: 24, chorizo: 24, oignon: 22 };

const S = 1400;
const R = 620;
const CX = S / 2;
const CY = S / 2;

function drawPizza(flavors: Flavor[]) {
  const img = document.createElement('canvas');
  img.width = img.height = S;
  const g = img.getContext('2d')!;
  const rnd = rng(42);
  const N = flavors.length;
  const STEP = (Math.PI * 2) / N;
  // wooden board
  let gr = g.createRadialGradient(CX, CY, R * 0.9, CX, CY, R * 1.07);
  gr.addColorStop(0, '#b77a45'); gr.addColorStop(0.7, '#a46634'); gr.addColorStop(1, '#7f4a22');
  g.fillStyle = gr; g.beginPath(); g.arc(CX, CY, R * 1.07, 0, 7); g.fill();
  g.strokeStyle = 'rgba(90,50,20,.25)'; g.lineWidth = 2;
  for (let k = 0; k < 6; k++) { g.beginPath(); g.arc(CX, CY, R * (1.0 + k * 0.012), 0, 7); g.stroke(); }
  // crust
  gr = g.createRadialGradient(CX, CY, R * 0.86, CX, CY, R);
  gr.addColorStop(0, '#e9b866'); gr.addColorStop(0.55, '#d99a45'); gr.addColorStop(1, '#b9742c');
  g.fillStyle = gr; g.beginPath(); g.arc(CX, CY, R, 0, 7); g.fill();
  for (let k = 0; k < 140; k++) {
    const a = rnd() * 7, rr = R * (0.88 + rnd() * 0.1);
    g.fillStyle = `rgba(${(120 + rnd() * 40) | 0},${(60 + rnd() * 30) | 0},20,${0.15 + rnd() * 0.25})`;
    g.beginPath(); g.arc(CX + Math.cos(a) * rr, CY + Math.sin(a) * rr, 2 + rnd() * 5, 0, 7); g.fill();
  }
  const Ri = R * 0.89;
  flavors.forEach((f, i) => {
    const a0 = i * STEP - STEP / 2, a1 = a0 + STEP;
    g.save();
    g.beginPath(); g.moveTo(CX, CY); g.arc(CX, CY, Ri, a0, a1); g.closePath(); g.clip();
    const base = g.createRadialGradient(CX, CY, 0, CX, CY, Ri);
    if (f.base === 'tomato') { base.addColorStop(0, '#d6402a'); base.addColorStop(1, '#b92a17'); }
    else { base.addColorStop(0, '#f6ecd2'); base.addColorStop(1, '#ead7a9'); }
    g.fillStyle = base; g.fillRect(0, 0, S, S);
    for (let k = 0; k < 26; k++) {
      const t = a0 + rnd() * STEP, rr = Math.sqrt(rnd()) * Ri;
      blob(g, CX + Math.cos(t) * rr, CY + Math.sin(t) * rr, 18 + rnd() * 30, f.base === 'tomato' ? 'rgba(250,224,150,.55)' : 'rgba(244,206,110,.5)', rnd);
    }
    f.garnish.forEach(([type, n]) => {
      const sz = SIZE[type];
      const draw = GARNISH[type];
      if (!draw) return;
      for (let k = 0; k < n; k++) {
        const rr = R * (0.14 + Math.sqrt(rnd()) * 0.68);
        const margin = Math.min(STEP / 2 - 0.02, (sz * 1.2) / rr);
        const t = a0 + margin + rnd() * Math.max(0.001, STEP - 2 * margin);
        g.save(); g.translate(CX + Math.cos(t) * rr, CY + Math.sin(t) * rr); g.rotate(rnd() * 7);
        g.shadowColor = 'rgba(0,0,0,.18)'; g.shadowBlur = 4; g.shadowOffsetY = 2;
        draw(g, sz * (0.85 + rnd() * 0.3), rnd);
        g.restore();
      }
    });
    g.restore();
  });
  g.strokeStyle = 'rgba(110,60,25,.55)'; g.lineWidth = 5;
  for (let i = 0; i < N; i++) {
    const a = i * STEP - STEP / 2;
    g.beginPath(); g.moveTo(CX, CY); g.lineTo(CX + Math.cos(a) * R, CY + Math.sin(a) * R); g.stroke();
  }
  gr = g.createRadialGradient(CX - R * 0.3, CY - R * 0.35, 0, CX, CY, R);
  gr.addColorStop(0, 'rgba(255,255,255,.12)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.beginPath(); g.arc(CX, CY, R, 0, 7); g.fill();
  return img;
}

export function initFlavorWheel(opts: { reduced: boolean; scrollTo?: (y: number) => void }) {
  const section = document.querySelector<HTMLElement>('[data-wheel]');
  if (!section) return;
  const canvas = section.querySelector<HTMLCanvasElement>('[data-wheel-canvas]')!;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const flavors: Flavor[] = JSON.parse(section.querySelector('[data-wheel-data]')!.textContent!);
  const info = section.querySelector<HTMLElement>('[data-wheel-info]')!;
  const elName = section.querySelector<HTMLElement>('[data-wheel-name]')!;
  const elPrice = section.querySelector<HTMLElement>('[data-wheel-price]')!;
  const elDesc = section.querySelector<HTMLElement>('[data-wheel-desc]')!;
  const elIng = section.querySelector<HTMLElement>('[data-wheel-ing]')!;
  const elOrder = section.querySelector<HTMLAnchorElement>('[data-wheel-order]')!;
  const dots = [...section.querySelectorAll<HTMLButtonElement>('[data-wheel-dots] button')];
  const N = flavors.length;
  const STEP = (Math.PI * 2) / N;
  const pizza = drawPizza(flavors);
  const sans = getComputedStyle(document.body).fontFamily;

  let W = 0, H = 0, dpr = 1;
  let geo: { cx: number; cy: number; r: number; base: number; mobile: boolean } | null = null;
  let target = 0, rot = 0, rotTarget = 0, raf = 0, timer = 0;

  function fill(i: number) {
    const f = flavors[i];
    elName.textContent = f.name;
    elPrice.textContent = f.priceLabel;
    elDesc.replaceChildren(...f.desc.map((t) => Object.assign(document.createElement('p'), { textContent: t })));
    elIng.replaceChildren(
      ...f.ing.map(([n, c]) => {
        const li = document.createElement('li');
        const dot = document.createElement('i');
        dot.style.background = c;
        if (['#f6f1e4', '#efe3c4', '#f3efe6'].includes(c)) dot.style.boxShadow = 'inset 0 0 0 1px #d9cfb6';
        li.append(dot, n);
        return li;
      })
    );
    elOrder.href = f.order;
    dots.forEach((b, k) => {
      b.classList.toggle('is-active', k === i);
      b.setAttribute('aria-pressed', String(k === i));
    });
  }

  function swap(i: number) {
    if (opts.reduced) return fill(i);
    info.classList.add('is-leaving');
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      fill(i);
      info.classList.remove('is-leaving');
    }, 220);
  }

  function measure() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    const mobile = W < 900;
    if (mobile) {
      const r = Math.min(W * 0.8, 360);
      // just below the tallest flavour text, so the pizza never jumps or covers it
      const canvasTop = canvas.getBoundingClientRect().top;
      let textBottom = 0;
      flavors.forEach((_, i) => {
        fill(i);
        textBottom = Math.max(textBottom, info.getBoundingClientRect().bottom - canvasTop);
      });
      fill(target);
      const below = textBottom + 70 + r * 1.2;
      geo = { cx: W * 0.5, cy: Math.max(H - r * 0.35, below), r, base: -Math.PI / 2, mobile };
    } else {
      const r = Math.min(H * 0.6, W * 0.33);
      geo = { cx: W - r * 0.25 - W * 0.02, cy: H + r * 0.12 - H * 0.02, r, base: -Math.PI * 0.72, mobile };
      const minLeft = W * 0.5;
      if (geo.cx - r < minLeft) geo.cx = minLeft + r;
    }
    render();
  }

  function render() {
    if (!geo) return;
    const { cx, cy, r, base } = geo;
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.clearRect(0, 0, W, H);
    ctx!.save();
    ctx!.shadowColor = 'rgba(60,30,10,.22)'; ctx!.shadowBlur = 40; ctx!.shadowOffsetY = 18;
    ctx!.fillStyle = '#a46634'; ctx!.beginPath(); ctx!.arc(cx, cy, r * 1.07, 0, 7); ctx!.fill();
    ctx!.restore();
    const k = r / R;
    ctx!.save();
    ctx!.translate(cx, cy); ctx!.rotate(base + rot);
    ctx!.drawImage(pizza, -CX * k, -CY * k, S * k, S * k);
    ctx!.restore();
    // names around the pizza
    const rr = r * (geo.mobile ? 1.2 : 1.17);
    const fs = geo.mobile ? 12 : Math.max(13, Math.min(22, r * 0.048));
    ctx!.textAlign = 'center'; ctx!.textBaseline = 'middle';
    const gap = fs * 0.28;
    flavors.forEach((f, i) => {
      const active = i === target;
      ctx!.font = `${active ? 700 : 500} ${fs}px ${sans}`;
      ctx!.fillStyle = active ? '#b7321d' : '#7a6d63';
      const chars = [...f.short];
      const widths = chars.map((ch) => ctx!.measureText(ch).width + gap);
      const total = widths.reduce((a, b) => a + b, 0) - gap;
      let a = base + rot + i * STEP - total / rr / 2;
      chars.forEach((ch, j) => {
        const w = widths[j];
        const ac = a + (w - gap) / 2 / rr;
        ctx!.save();
        ctx!.translate(cx + Math.cos(ac) * rr, cy + Math.sin(ac) * rr);
        ctx!.rotate(ac + Math.PI / 2);
        ctx!.fillText(ch, 0, 0);
        ctx!.restore();
        a += w / rr;
      });
    });
  }

  function progress() {
    const rect = section!.getBoundingClientRect();
    const h = section!.offsetHeight - window.innerHeight;
    return h > 0 ? Math.min(1, Math.max(0, -rect.top / h)) : 0;
  }

  function loop() {
    if (raf) return;
    const step = () => {
      const d = rotTarget - rot;
      rot += d * 0.12;
      if (Math.abs(d) < 0.0005) {
        rot = rotTarget;
        render();
        raf = 0;
        return;
      }
      render();
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }

  function onScroll() {
    const i = Math.min(N - 1, Math.floor(progress() * N));
    if (i !== target) {
      target = i;
      swap(i);
    }
    rotTarget = -target * STEP;
    if (opts.reduced) {
      rot = rotTarget;
      render();
    } else loop();
  }

  function goTo(i: number) {
    const top = section!.getBoundingClientRect().top + window.scrollY;
    const h = section!.offsetHeight - window.innerHeight;
    const y = top + ((i + 0.5) / N) * h;
    if (opts.scrollTo) opts.scrollTo(y);
    else window.scrollTo({ top: y, behavior: opts.reduced ? 'auto' : 'smooth' });
  }

  dots.forEach((b, i) => b.addEventListener('click', () => goTo(i)));
  canvas.addEventListener('click', (e) => {
    if (!geo) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - geo.cx;
    const y = e.clientY - rect.top - geo.cy;
    if (Math.hypot(x, y) > geo.r * 1.35) return;
    let i = Math.round((Math.atan2(y, x) - geo.base - rot) / STEP);
    i = ((i % N) + N) % N;
    goTo(i);
  });

  measure();
  window.addEventListener('resize', measure);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  document.fonts?.ready.then(render);
}
