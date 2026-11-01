/**
 * Home hero brand video: the sliced pizza turning on its board with steam (public/video).
 *
 * Two copies of the same clip take turns: shortly before one ends, the other starts from
 * the beginning and fades in on top, so the loop has no visible jump. Scrolling moves the
 * camera slightly closer. Videos only play while the hero is on screen and the tab is
 * visible, and a button lets visitors pause them (WCAG 2.2.2). Nothing plays with reduced
 * motion or when the visitor has asked to save data: the poster frame stays as a photo.
 */

const FADE = 0.7; // seconds of cross-fade at the loop point

export function initPizza(opts: { reduced: boolean }) {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const media = hero?.querySelector<HTMLElement>('.hero__media');
  const videos = [...(hero?.querySelectorAll<HTMLVideoElement>('[data-hero-video]') ?? [])];
  const pauseBtn = hero?.querySelector<HTMLButtonElement>('[data-hero-pause]');
  if (!hero || !media || videos.length < 2) return;

  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
  if (opts.reduced || saveData) return;

  let front = 0;
  let visible = true;
  let switching = false;
  let paused = false;
  let looping = false;

  function play(v: HTMLVideoElement) {
    v.play().catch(() => {
      /* autoplay blocked (e.g. low-power mode): the poster stays */
    });
  }

  function tick() {
    const v = videos[front];
    if (!switching && v.duration && v.currentTime > v.duration - FADE - 0.05) {
      switching = true;
      const next = videos[1 - front];
      next.currentTime = 0;
      play(next);
      next.classList.add('is-front');
      v.classList.remove('is-front');
      window.setTimeout(() => {
        v.pause();
        front = 1 - front;
        switching = false;
      }, FADE * 1000 + 50);
    }
    // Slight push-in while scrolling past the hero
    const r = hero!.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)));
    media!.style.transform = `scale(${1 + p * 0.08})`;
    if (visible && !document.hidden && !paused) requestAnimationFrame(tick);
    else looping = false;
  }

  function start() {
    if (paused || !visible || document.hidden) return;
    play(videos[front]);
    if (!looping) {
      looping = true;
      requestAnimationFrame(tick);
    }
  }
  const stop = () => videos.forEach((v) => v.pause());

  // The second copy only loads once the first is playing
  videos[0].preload = 'auto';
  videos[0].addEventListener(
    'playing',
    () => {
      videos[1].preload = 'auto';
      videos[1].load();
      if (pauseBtn) pauseBtn.hidden = false;
    },
    { once: true }
  );

  if (pauseBtn) {
    const iconPause = pauseBtn.querySelector<SVGElement>('[data-icon-pause]')!;
    const iconPlay = pauseBtn.querySelector<SVGElement>('[data-icon-play]')!;
    const label = pauseBtn.querySelector<HTMLElement>('[data-pause-label]')!;
    pauseBtn.addEventListener('click', () => {
      paused = !paused;
      pauseBtn.setAttribute('aria-pressed', String(paused));
      iconPause.toggleAttribute('hidden', paused);
      iconPlay.toggleAttribute('hidden', !paused);
      label.textContent = paused ? 'Tocar o vídeo' : 'Pausar o vídeo';
      if (paused) stop();
      else start();
    });
  }

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) start();
    else stop();
  }).observe(hero);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });
  start();
}
