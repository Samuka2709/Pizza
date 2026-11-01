/**
 * Pizza deck (home): cards stacked and fanned; the front card flies off and goes to the
 * back on Next, a drag/flick, or the arrow keys. Previous brings the last card back.
 *
 * - Buttons and keyboard always work (dragging is never the only way, WCAG 2.2 2.5.7)
 * - A quick flick dismisses even a short drag (velocity), not only a long one
 * - Pointer capture keeps the drag going outside the card; extra touches are ignored
 * - touch-action: pan-y keeps vertical page scrolling on phones
 * - Reduced motion: cards swap with a fade, nothing flies
 * - Scroll (desktop, [data-deck-scroll] section): the section is pinned and scrolling
 *   spreads all the cards out to both sides at once; scrolling back gathers them
 */
const FAN = [
  { x: 0, y: 0, r: 0 }, // front card stays upright so its text is sharp
  { x: 26, y: 10, r: 5 },
  { x: -24, y: 16, r: -7 },
  { x: 14, y: 24, r: 9 },
];

export function initDeck(opts: { reduced: boolean }) {
  document.querySelectorAll<HTMLElement>('[data-deck]').forEach((deck) => {
    const cards = [...deck.querySelectorAll<HTMLElement>('[data-deck-card]')];
    const count = deck.querySelector<HTMLElement>('[data-deck-count]');
    const stack = deck.querySelector<HTMLElement>('.deck__stack')!;
    if (!cards.length) return;
    let order = cards.map((_, i) => i); // order[0] is the front card
    let busy = false;

    function layout(animate = true) {
      order.forEach((idx, pos) => {
        const c = cards[idx];
        const f = FAN[Math.min(pos, FAN.length - 1)];
        c.style.transition = animate ? '' : 'none';
        c.style.zIndex = String(cards.length - pos);
        c.style.transform = `translate(${f.x}px, ${f.y}px) rotate(${f.r}deg)`;
        c.style.opacity = pos < FAN.length ? '1' : '0';
        const front = pos === 0;
        c.toggleAttribute('inert', !front);
        c.setAttribute('aria-hidden', String(!front));
      });
      if (count) count.textContent = `${order[0] + 1} / ${cards.length}`;
    }

    function next(dir = 1) {
      if (busy || deck.classList.contains('deck--spread')) return;
      const front = cards[order[0]];
      if (opts.reduced) {
        order.push(order.shift()!);
        layout(false);
        return;
      }
      busy = true;
      // fly off to the side, then slide in at the back of the stack
      front.style.transition = 'transform 260ms cubic-bezier(0.23, 1, 0.32, 1), opacity 260ms ease';
      front.style.transform = `translate(${dir * 120}%, -6%) rotate(${dir * 18}deg)`;
      window.setTimeout(() => {
        order.push(order.shift()!);
        layout();
        busy = false;
      }, 220);
    }

    function prev() {
      if (busy || deck.classList.contains('deck--spread')) return;
      order.unshift(order.pop()!);
      const back = cards[order[0]];
      if (!opts.reduced) {
        back.style.transition = 'none';
        back.style.transform = 'translate(-120%, -6%) rotate(-18deg)';
        void back.offsetWidth;
      }
      layout(!opts.reduced);
    }

    deck.querySelector('[data-deck-next]')?.addEventListener('click', () => next(1));
    deck.querySelector('[data-deck-prev]')?.addEventListener('click', prev);
    deck.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        next(1);
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      }
    });

    // Drag / flick the front card
    let pointerId: number | null = null;
    let startX = 0;
    let startT = 0;
    let dx = 0;
    stack.addEventListener('pointerdown', (e) => {
      if (pointerId !== null || busy || e.button !== 0 || deck.classList.contains('deck--spread')) return; // ignore extra touches
      const front = cards[order[0]];
      if (!front.contains(e.target as Node)) return;
      pointerId = e.pointerId;
      startX = e.clientX;
      startT = performance.now();
      dx = 0;
      front.setPointerCapture(e.pointerId);
      front.style.transition = 'none';
      deck.classList.add('is-dragging');
    });
    stack.addEventListener('pointermove', (e) => {
      if (e.pointerId !== pointerId) return;
      dx = e.clientX - startX;
      const front = cards[order[0]];
      front.style.transform = `translate(${dx}px, ${Math.abs(dx) * -0.04}px) rotate(${-2 + dx * 0.06}deg)`;
    });
    const end = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      pointerId = null;
      deck.classList.remove('is-dragging');
      const velocity = Math.abs(dx) / Math.max(1, performance.now() - startT);
      if (Math.abs(dx) > 90 || (velocity > 0.11 && Math.abs(dx) > 12)) next(dx > 0 ? 1 : -1);
      else layout(); // snap back
    };
    stack.addEventListener('pointerup', end);
    stack.addEventListener('pointercancel', end);

    /** Bring card `target` to the front, one step at a time if it is the next/previous one */
    function goTo(target: number) {
      const cur = order[0];
      if (target === cur) return;
      const n = cards.length;
      if (target === (cur + 1) % n && !busy) return next(1);
      if (target === (cur - 1 + n) % n && !busy) return prev();
      order = cards.map((_, i) => (target + i) % n);
      layout();
    }

    // Scroll driver (desktop): pinned section; scrolling spreads the whole stack out to
    // both sides at once, like a hand of cards. Scrolling back gathers them again.
    const section = deck.closest<HTMLElement>('[data-deck-scroll]');
    const bar = section?.querySelector<HTMLElement>('[data-deck-progress]');
    const wide = window.matchMedia('(min-width: 900px)');
    let spreadOn = false;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    function layoutSpread(p: number) {
      const n = cards.length;
      // outer cards stay fully on screen
      const cardW = cards[0].offsetWidth;
      const reach = Math.min(window.innerWidth / 2 - cardW / 2 - 36, 660);
      cards.forEach((c, i) => {
        const t = (i - (n - 1) / 2) / ((n - 1) / 2); // -1 … 1
        const f = FAN[Math.min(i, FAN.length - 1)];
        // each card leaves the stack a little after the previous one, but all within the same scroll
        const k = ease(Math.min(1, Math.max(0, p * 1.25 - Math.abs(t) * 0.25)));
        const x = f.x + (t * reach - f.x) * k;
        const y = f.y + (t * t * 30 - f.y) * k;
        const r = f.r + (t * 5 - f.r) * k;
        c.style.transition = 'none';
        c.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg)`;
        c.style.opacity = '1';
        c.style.zIndex = String(k > 0.5 ? i + 1 : n - i);
        c.removeAttribute('inert');
        c.setAttribute('aria-hidden', 'false');
      });
      if (bar) bar.style.transform = `scaleX(${p})`;
    }

    if (section && !opts.reduced) {
      let ticking = false;
      const onScroll = () => {
        ticking = false;
        const on = wide.matches;
        if (on !== spreadOn) {
          spreadOn = on;
          deck.classList.toggle('deck--spread', on);
          if (!on) {
            order = cards.map((_, i) => i);
            layout(false);
          }
        }
        if (!on) return;
        const r = section.getBoundingClientRect();
        const range = r.height - window.innerHeight;
        layoutSpread(range > 0 ? Math.min(1, Math.max(0, -r.top / range)) : 1);
      };
      const queue = () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(onScroll);
        }
      };
      window.addEventListener('scroll', queue, { passive: true });
      window.addEventListener('resize', queue);
      // wait for layout(false) below, then take over
      requestAnimationFrame(onScroll);
    }

    layout(false);
  });
}
