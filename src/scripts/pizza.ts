/**
 * Main animation (home hero): the sliced pepperoni pizza turns slowly on its wooden board,
 * steam rising from it, like the brand-video references.
 *
 * It is one still photo (public/img/hero/scene*.webp). In WebGL, every pixel of the pizza's
 * top is mapped back onto the plane of the table (a homography measured from the photo),
 * rotated there and projected again, so the turn keeps the camera's perspective: the far side
 * stays smaller than the near side. The board, table and kitchen do not move.
 * Steam is drawn on a 2D canvas on top. Scrolling turns the pizza a little further and moves
 * the camera slightly closer. Everything only runs while the hero is on screen; with reduced
 * motion a single still frame is drawn.
 */

/** Photo size and the pizza's plane, in the photo's own pixels (1226 × 683) */
const PHOTO = { w: 1226, h: 683 };
const PLANE = { h11: 443.69, h22: 171.63, h32: -0.13023, cx: 610, cy: 305 };
/** Visual centre of the pizza and its half width/height on screen, in photo pixels */
const PIZZA = { x: 610, y: 335, halfW: 448, halfH: 225 };
const TURN_SECONDS = 70; // one full turn

const VERT = `
attribute vec2 pos;
void main() { gl_Position = vec4(pos, 0.0, 1.0); }
`;
const FRAG = `
precision highp float;
uniform sampler2D tex;
uniform vec2 photo;
uniform vec2 canvas;
uniform float scale;
uniform vec2 offset;
uniform float theta;
uniform vec3 H;
uniform vec2 C;
uniform float fadeTop;
vec4 pick(vec2 p) { return texture2D(tex, p / photo); }
void main() {
  vec2 frag = vec2(gl_FragCoord.x, canvas.y - gl_FragCoord.y);
  vec2 img = (frag - offset) / scale;
  if (img.x < 0.0 || img.y < 0.0 || img.x > photo.x || img.y > photo.y) { gl_FragColor = vec4(0.0); return; }
  vec4 col = pick(img);
  float v = (img.y - C.y) / (H.y - H.z * img.y);
  float u = (img.x - C.x) * (1.0 + H.z * v) / H.x;
  float r = length(vec2(u, v));
  if (r < 1.0) {
    float c = cos(theta), s = sin(theta);
    vec2 q = vec2(c * u - s * v, s * u + c * v);
    float d = 1.0 + H.z * q.y;
    vec2 src = vec2(C.x + H.x * q.x / d, (H.y * q.y + C.y) / d);
    col = mix(col, pick(src), smoothstep(1.0, 0.975, r));
  }
  float a = fadeTop > 0.0 ? smoothstep(0.0, fadeTop, img.y / photo.y) : 1.0;
  gl_FragColor = vec4(col.rgb * a, a);
}
`;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

interface Puff {
  x: number;
  y: number;
  born: number;
  life: number;
  size: number;
  drift: number;
  phase: number;
}

export function initPizza(opts: { reduced: boolean }) {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const glCanvas = document.querySelector<HTMLCanvasElement>('[data-pizza]');
  const steamCanvas = document.querySelector<HTMLCanvasElement>('[data-steam]');
  if (!hero || !glCanvas) return;
  const gl = glCanvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
  const sctx = steamCanvas?.getContext('2d') ?? null;
  if (!gl) {
    hero.classList.add('hero--static');
    return;
  }

  // ---- WebGL setup ----
  const shader = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    hero.classList.add('hero--static');
    return;
  }
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(prog, 'pos');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
  const U = (n: string) => gl.getUniformLocation(prog, n);
  const uPhoto = U('photo');
  const uCanvas = U('canvas');
  const uScale = U('scale');
  const uOffset = U('offset');
  const uTheta = U('theta');
  const uH = U('H');
  const uC = U('C');
  const uFade = U('fadeTop');
  gl.uniform2f(uPhoto, PHOTO.w, PHOTO.h);
  gl.uniform3f(uH, PLANE.h11, PLANE.h22, PLANE.h32);
  gl.uniform2f(uC, PLANE.cx, PLANE.cy);

  let w = 0;
  let h = 0;
  let dpr = 1;
  let wide = false;
  let ready = false;
  let visible = true;
  let raf = 0;
  let scrollTurn = 0;
  let zoom = 1;
  const start = performance.now();
  const puffs: Puff[] = [];
  let lastSpawn = 0;

  function layout() {
    const rect = glCanvas!.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    wide = w >= 900;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    glCanvas!.width = Math.round(w * dpr);
    glCanvas!.height = Math.round(h * dpr);
    if (steamCanvas) {
      steamCanvas.width = glCanvas!.width;
      steamCanvas.height = glCanvas!.height;
    }
    gl!.viewport(0, 0, glCanvas!.width, glCanvas!.height);
  }

  /** Where the photo sits on screen (CSS px): screen = photo * scale + offset */
  function placement() {
    if (wide) {
      // Full-bleed like the reference, pizza a little right of centre so the headline has room
      const base = Math.max(w / PHOTO.w, h / PHOTO.h) * zoom;
      let ox = w * 0.6 - PIZZA.x * base;
      let oy = h * 0.56 - PIZZA.y * base;
      ox = Math.min(0, Math.max(w - PHOTO.w * base, ox));
      oy = Math.min(0, Math.max(h - PHOTO.h * base, oy));
      return { scale: base, ox, oy };
    }
    // Phones: the pizza fills the width at the bottom, the photo fades into the cream above
    const s = ((w * 0.98) / (PIZZA.halfW * 2)) * zoom;
    return { scale: s, ox: w / 2 - PIZZA.x * s, oy: h - 40 - (PIZZA.y + PIZZA.halfH + 90) * s };
  }

  function drawGL(theta: number) {
    const { scale, ox, oy } = placement();
    gl!.uniform2f(uCanvas, glCanvas!.width, glCanvas!.height);
    gl!.uniform1f(uScale, scale * dpr);
    gl!.uniform2f(uOffset, ox * dpr, oy * dpr);
    gl!.uniform1f(uTheta, theta);
    gl!.uniform1f(uFade, wide ? 0 : 0.42);
    gl!.clearColor(0, 0, 0, 0);
    gl!.clear(gl!.COLOR_BUFFER_BIT);
    gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
  }

  function drawSteam(t: number) {
    if (!sctx) return;
    const { scale, ox, oy } = placement();
    const px = (PIZZA.x * scale + ox) * dpr;
    const py = (PIZZA.y * scale + oy) * dpr;
    const pw = PIZZA.halfW * scale * dpr;
    const ph = PIZZA.halfH * scale * dpr;
    // new puffs rise from random points on the pizza
    if (t - lastSpawn > 0.09) {
      lastSpawn = t;
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 0.8;
      puffs.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, born: t, life: 4 + Math.random() * 3, size: 0.12 + Math.random() * 0.12, drift: (Math.random() - 0.5) * 0.4, phase: Math.random() * 6 });
    }
    sctx.clearRect(0, 0, steamCanvas!.width, steamCanvas!.height);
    for (let i = puffs.length - 1; i >= 0; i--) {
      const p = puffs[i];
      const k = (t - p.born) / p.life;
      if (k >= 1) {
        puffs.splice(i, 1);
        continue;
      }
      const x = px + (p.x + p.drift * k + Math.sin(t * 0.8 + p.phase) * 0.06 * k) * pw;
      const y = py + p.y * ph - k * ph * 2.1;
      const rad = (p.size + k * 0.35) * pw;
      const alpha = Math.sin(Math.PI * k) * 0.16;
      const g = sctx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, `rgb(255 255 255 / ${alpha})`);
      g.addColorStop(0.6, `rgb(255 255 255 / ${alpha * 0.45})`);
      g.addColorStop(1, 'rgb(255 255 255 / 0)');
      sctx.fillStyle = g;
      sctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
  }

  function readScroll() {
    const rect = hero!.getBoundingClientRect();
    return clamp(-rect.top / Math.max(1, rect.height));
  }

  let smoothScroll = 0;
  function frame() {
    raf = 0;
    const t = (performance.now() - start) / 1000;
    smoothScroll += (readScroll() - smoothScroll) * 0.12;
    scrollTurn = smoothScroll * Math.PI * 0.5;
    zoom = 1 + smoothScroll * 0.1;
    drawGL((t / TURN_SECONDS) * Math.PI * 2 + scrollTurn);
    drawSteam(t);
    if (visible && !document.hidden) raf = requestAnimationFrame(frame);
  }

  const img = new Image();
  img.decoding = 'async';
  img.src = window.innerWidth >= 900 ? '/img/hero/scene.webp' : '/img/hero/scene-sm.webp';
  img.onload = () => {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    ready = true;
    layout();
    hero.classList.add('is-ready');
    if (opts.reduced) drawGL(0);
    else if (!raf) raf = requestAnimationFrame(frame);
  };

  if (!opts.reduced) {
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && ready && !raf) raf = requestAnimationFrame(frame);
    }).observe(hero);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && visible && ready && !raf) raf = requestAnimationFrame(frame);
    });
  }

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (!ready) return;
      layout();
      if (opts.reduced) drawGL(0);
    }, 120);
  });
}
