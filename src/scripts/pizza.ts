/**
 * Home hero brand video: the sliced pizza turning on its board with steam (public/video).
 *
 * Two copies of the same clip take turns: shortly before one ends, the other starts from
 * the beginning and fades in on top, so the loop has no visible jump. Scrolling moves the
 * camera slightly closer. Videos only play while the hero is on screen and the tab is
 * visible. With reduced motion nothing plays: the poster frame stays as a still photo.
 */

const FADE = 0.7; // seconds of cross-fade at the loop point

export function initPizza(opts: { reduced: boolean }) {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const media = hero?.querySelector<HTMLElement>('.hero__media');
  const videos = [...(hero?.querySelectorAll<HTMLVideoElement>('[data-hero-video]') ?? [])];
  if (!hero || !media || videos.length < 2 || opts.reduced) return;

  let front = 0;
  let visible = true;
  let switching = false;

  const back = () => videos[1 - front];

  function play(v: HTMLVideoElement) {
    v.play().catch(() => {
      /* autoplay blocked (e.g. low-power mode): the poster stays */
    });
  }

  function tick() {
    const v = videos[front];
    if (!switching && v.duration && v.currentTime > v.duration - FADE - 0.05) {
      switching = true;
      const next = back();
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
    if (visible && !document.hidden) requestAnimationFrame(tick);
  }

  function start() {
    play(videos[front]);
    requestAnimationFrame(tick);
  }

  // The second copy only loads once the first is playing
  videos[0].addEventListener(
    'playing',
    () => {
      videos[1].preload = 'auto';
      videos[1].load();
    },
    { once: true }
  );

  new IntersectionObserver(([e]) => {
    const was = visible;
    visible = e.isIntersecting;
    if (visible && !was) start();
    if (!visible) videos.forEach((v) => v.pause());
  }).observe(hero);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) videos.forEach((v) => v.pause());
    else if (visible) start();
  });
  start();
}
