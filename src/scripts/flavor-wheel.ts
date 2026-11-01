/**
 * "Gire a pizza" (home), in the style of the Figma rotating slider reference:
 * half a whole pizza rises from the bottom; the flavour names sit on an arc around it.
 * The section is pinned and each slice of scroll moves one flavour: the current pizza spins
 * out while the next one spins in (CSS transitions), the arc of names turns so the current
 * name sits at the dot, and the text swaps in a cascade with the price counting.
 * Arrows, names and the keyboard also move between flavours. Reduced motion: no spin.
 */
interface Flavor {
  name: string;
  price: number;
  priceLabel: string;
  desc: string[];
  ing: [string, string][];
  order: string;
}

export function initFlavorWheel(opts: { reduced: boolean; scrollTo?: (y: number) => void }) {
  const section = document.querySelector<HTMLElement>('[data-wheel]');
  if (!section) return;
  const flavors: Flavor[] = JSON.parse(section.querySelector('[data-wheel-data]')!.textContent!);
  const info = section.querySelector<HTMLElement>('[data-wheel-info]')!;
  const elName = section.querySelector<HTMLElement>('[data-wheel-name]')!;
  const elPrice = section.querySelector<HTMLElement>('[data-wheel-price]')!;
  const elDesc = section.querySelector<HTMLElement>('[data-wheel-desc]')!;
  const elIng = section.querySelector<HTMLElement>('[data-wheel-ing]')!;
  const elOrder = section.querySelector<HTMLAnchorElement>('[data-wheel-order]')!;
  const names = section.querySelector<HTMLElement>('[data-wheel-names]')!;
  const nameBtns = [...section.querySelectorAll<HTMLButtonElement>('[data-wheel-go]')];
  const pizzas = [...section.querySelectorAll<HTMLImageElement>('[data-wheel-pizza]')];
  const N = flavors.length;
  let current = 0;
  let timer = 0;

  function fill(i: number) {
    const f = flavors[i];
    elName.textContent = f.name;
    elPrice.textContent = f.priceLabel;
    elDesc.replaceChildren(Object.assign(document.createElement('p'), { textContent: f.desc[0] }));
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
  }

  function countPrice(from: number, to: number) {
    if (opts.reduced || from === to) return;
    const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / 500);
      elPrice.textContent = fmt.format(from + (to - from) * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function show(i: number) {
    if (i === current) return;
    const prev = current;
    current = i;
    // pizzas: the ones before spin out one way, the ones after wait the other way
    pizzas.forEach((img, k) => {
      img.classList.toggle('is-active', k === i);
      img.classList.toggle('is-prev', k < i);
      img.classList.toggle('is-next', k > i);
      img.alt = k === i ? `Pizza de ${flavors[k].name} vista de cima` : '';
    });
    // arc of names turns so the current one sits at the dot
    names.style.setProperty('--at', String(i));
    nameBtns.forEach((b, k) => {
      b.classList.toggle('is-active', k === i);
      b.setAttribute('aria-pressed', String(k === i));
    });
    // text: leave, then come back in a cascade
    if (opts.reduced) return fill(i);
    const from = flavors[prev].price;
    info.classList.remove('is-entering');
    info.classList.add('is-leaving');
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      fill(i);
      elPrice.textContent = flavors[prev].priceLabel;
      info.classList.remove('is-leaving');
      info.classList.add('is-entering');
      void info.offsetWidth;
      info.classList.remove('is-entering');
      countPrice(from, flavors[i].price);
    }, 200);
  }

  function progress() {
    const rect = section!.getBoundingClientRect();
    const h = section!.offsetHeight - window.innerHeight;
    return h > 0 ? Math.min(1, Math.max(0, -rect.top / h)) : 0;
  }

  let ticking = false;
  function onScroll() {
    ticking = false;
    show(Math.min(N - 1, Math.floor(progress() * N)));
  }

  function goTo(i: number) {
    i = Math.max(0, Math.min(N - 1, i));
    const top = section!.getBoundingClientRect().top + window.scrollY;
    const h = section!.offsetHeight - window.innerHeight;
    const y = top + ((i + 0.5) / N) * h;
    if (opts.scrollTo) opts.scrollTo(y);
    else window.scrollTo({ top: y, behavior: opts.reduced ? 'auto' : 'smooth' });
  }

  nameBtns.forEach((b, i) => b.addEventListener('click', () => goTo(i)));
  section.querySelector('[data-wheel-prev]')?.addEventListener('click', () => goTo(current - 1));
  section.querySelector('[data-wheel-next]')?.addEventListener('click', () => goTo(current + 1));
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    },
    { passive: true }
  );
  onScroll();
}
