import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { initPizza } from './pizza';
import { initDeck } from './deck';
import { initFlavorWheel } from './flavor-wheel';
import { initCart } from './cart';

gsap.registerPlugin(ScrollTrigger);
(window as unknown as { __motionReady: boolean }).__motionReady = true;

interface SiteData {
  timezone: string;
  popup: { weekday: number; open: string; close: string };
  hours: ([string, string] | null)[];
  endpoint: string;
}

const data: SiteData = JSON.parse(document.getElementById('site-data')!.textContent!);
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const EASE = 'expo.out';
const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => [...root.querySelectorAll<T>(s)];

/* --------------------------------------------------------------------------
   Smooth scrolling (Lenis) in sync with ScrollTrigger
   -------------------------------------------------------------------------- */
let lenis: Lenis | null = null;
if (!reduced) {
  lenis = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 4) });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

document.addEventListener('click', (e) => {
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href')!.slice(1);
  const target = id ? document.getElementById(id) : null;
  if (!target) return;
  e.preventDefault();
  closeMenu(false);
  if (lenis) lenis.scrollTo(target, { offset: -16 });
  else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  history.replaceState(null, '', `#${id}`);
});

/* --------------------------------------------------------------------------
   Header: background once scrolled, hides going down, returns going up
   -------------------------------------------------------------------------- */
const header = $('[data-header]')!;
const heroEl = $('[data-hero]');
let lastY = window.scrollY;
let ticking = false;
function onScroll() {
  const y = window.scrollY;
  header.classList.toggle('is-scrolled', y > 40);
  // Light header text while it sits over the home hero photo (desktop)
  header.classList.toggle('is-on-dark', !!heroEl && heroEl.getBoundingClientRect().bottom > header.offsetHeight);
  const menuOpen = document.documentElement.classList.contains('menu-open');
  header.classList.toggle('is-hidden', y > lastY && y > 320 && !menuOpen);
  document.body.classList.toggle('header-visible', !header.classList.contains('is-hidden'));
  lastY = y;
  ticking = false;
}
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

/* --------------------------------------------------------------------------
   Full-screen mobile menu
   -------------------------------------------------------------------------- */
const menu = $('[data-menu]')!;
const menuBtn = $<HTMLButtonElement>('[data-menu-open]')!;
const behindMenu = $$('main, footer, .mobile-bar');

function openMenu() {
  menu.removeAttribute('inert');
  menu.classList.add('is-open');
  document.documentElement.classList.add('menu-open');
  menuBtn.setAttribute('aria-expanded', 'true');
  behindMenu.forEach((el) => el.setAttribute('inert', ''));
  lenis?.stop();
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => $<HTMLElement>('[data-menu-link]', menu)?.focus());
}
function closeMenu(returnFocus = true) {
  if (!menu.classList.contains('is-open')) return;
  menu.classList.remove('is-open');
  menu.setAttribute('inert', '');
  document.documentElement.classList.remove('menu-open');
  menuBtn.setAttribute('aria-expanded', 'false');
  behindMenu.forEach((el) => el.removeAttribute('inert'));
  lenis?.start();
  document.body.style.overflow = '';
  if (returnFocus) menuBtn.focus();
}
menuBtn.addEventListener('click', openMenu);
$('[data-menu-close]')!.addEventListener('click', () => closeMenu());
menu.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
  if (e.key !== 'Tab') return;
  const focusables = $$<HTMLElement>('a, button', menu);
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});
window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => e.matches && closeMenu(false));

/* --------------------------------------------------------------------------
   Mobile quick-action bar: shows once the visitor is past the opening block
   -------------------------------------------------------------------------- */
const bar = $('[data-mobile-bar]')!;
const watchEl = $('.hero__ctas') ?? $('.page-hero');
if (watchEl) {
  new IntersectionObserver(([entry]) => bar.classList.toggle('is-visible', !entry.isIntersecting && entry.boundingClientRect.top < 0)).observe(watchEl);
}

/* --------------------------------------------------------------------------
   Próximo rodízio (sempre no horário da pizzaria)
   -------------------------------------------------------------------------- */
function localNow() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: data.timezone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return {
    day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday')),
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  };
}
const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const hourLabel = (t: string) => {
  const [h, m] = t.split(':');
  return m === '00' ? `${Number(h)}h` : `${Number(h)}h${m}`;
};

function popupStatus() {
  const { weekday, open, close } = data.popup;
  const now = localNow();
  const times = `das ${hourLabel(open)} às ${hourLabel(close)}`;
  if (now.day === weekday) {
    if (now.minutes < toMin(open)) return { live: false, short: `Hoje tem rodízio, ${times}`, long: `Hoje tem rodízio a partir das ${hourLabel(open)}.` };
    if (now.minutes < toMin(close)) return { live: true, short: `Rodízio acontecendo agora, até as ${hourLabel(close)}`, long: `O rodízio está rolando agora, até as ${hourLabel(close)}. Venha com fome.` };
  }
  const days = (weekday - now.day + 7) % 7 || 7;
  const when = days === 1 ? 'amanhã' : `em ${days} dias`;
  return { live: false, short: `Próximo rodízio ${days === 1 ? 'amanhã' : 'na sexta'}, ${times}`, long: `Próximo rodízio ${when}: sexta, ${times}.` };
}
const status = popupStatus();
$$('[data-next-popup]').forEach((el) => {
  el.textContent = status.short;
  el.closest('.hero__info')?.classList.toggle('is-live', status.live);
});
$$('[data-next-popup-long]').forEach((el) => {
  el.innerHTML = `<span class="live-dot${status.live ? ' is-live' : ''}" aria-hidden="true"></span>${status.long}`;
});

/* --------------------------------------------------------------------------
   Horário de funcionamento: destaca o dia de hoje e diz se está aberto agora
   -------------------------------------------------------------------------- */
const WEEKDAY = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
function openStatus() {
  const now = localNow();
  const today = data.hours[now.day];
  if (today && now.minutes >= toMin(today[0]) && now.minutes < toMin(today[1])) {
    return { open: true, text: `Aberto agora, até as ${hourLabel(today[1])}` };
  }
  if (today && now.minutes < toMin(today[0])) return { open: false, text: `Fechado agora. Abre hoje às ${hourLabel(today[0])}` };
  for (let k = 1; k <= 7; k++) {
    const d = (now.day + k) % 7;
    const h = data.hours[d];
    if (h) return { open: false, text: `Fechado agora. Abre ${k === 1 ? 'amanhã' : WEEKDAY[d]} às ${hourLabel(h[0])}` };
  }
  return { open: false, text: 'Fechado' };
}
if (data.hours.some(Boolean)) {
  const st = openStatus();
  const today = localNow().day;
  $$('[data-hours]').forEach((el) => {
    const line = $('[data-hours-status]', el)!;
    $('[data-hours-text]', line)!.textContent = st.text;
    $('.live-dot', line)!.classList.toggle('is-live', st.open);
    line.hidden = false;
    const row = $(`[data-day="${today}"]`, el);
    if (row) {
      row.classList.add('is-today');
      row.setAttribute('aria-current', 'date');
    }
  });
}

/* --------------------------------------------------------------------------
   Main animation (home)
   -------------------------------------------------------------------------- */
initPizza({ reduced });
initCart({ reduced });
initDeck({ reduced });
initFlavorWheel({ reduced, scrollTo: lenis ? (y) => lenis!.scrollTo(y, { duration: 1 }) : undefined });

/* --------------------------------------------------------------------------
   Entrance and scroll animations
   -------------------------------------------------------------------------- */
function splitWords(el: HTMLElement) {
  const words = el.textContent!.trim().split(/\s+/);
  el.innerHTML = words.map((w) => `<span class="mask"><span>${w}</span></span>`).join(' ');
}

if (!reduced) {
  // Titles: words rise from behind a mask (the text is already in the HTML, only the motion is added)
  gsap.fromTo($$('.hero [data-split] .mask > span'), { y: '110%' }, { y: '0%', duration: 0.9, ease: EASE, stagger: 0.07, delay: 0.1 });
  gsap.fromTo('.hero__eyebrow, .hero__info', { opacity: 0 }, { opacity: 1, duration: 0.8, delay: 0.5, ease: 'power1.out' });

  $$('[data-split-auto]').forEach(splitWords);
  const pageHeroTitle = $('.page-hero [data-split-auto]');
  if (pageHeroTitle) gsap.fromTo($$('.mask > span', pageHeroTitle), { y: '110%' }, { y: '0%', duration: 0.9, ease: EASE, stagger: 0.06, delay: 0.1 });

  if ('requestIdleCallback' in window) requestIdleCallback(setupScrollReveals, { timeout: 800 });
  else setTimeout(setupScrollReveals, 200);
}

function setupScrollReveals() {
  $$('[data-split-auto]').forEach((el) => {
    if (el.closest('.page-hero')) return;
    gsap.fromTo($$('.mask > span', el), { y: '110%' }, { y: '0%', duration: 0.9, ease: EASE, stagger: 0.05, scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  ScrollTrigger.batch('[data-reveal="fade"]', {
    start: 'top 92%',
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.8, ease: EASE, stagger: 0.07, overwrite: true }),
  });

  // Photos open from the bottom
  $$('[data-reveal="clip"]').forEach((el) => {
    gsap.to(el, { clipPath: 'inset(0% 0 0 0)', duration: 1, ease: 'power3.inOut', scrollTrigger: { trigger: el, start: 'top 90%' } });
  });

  // Gentle parallax on a few photos only
  $$('[data-parallax]').forEach((el) => {
    const amount = Number(el.dataset.parallax);
    gsap.fromTo(el, { yPercent: -amount / 2 }, { yPercent: amount / 2, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // Pizza drawing on inner page heroes rolls away as you scroll
  const spin = $('[data-spin]');
  if (spin) gsap.to(spin, { rotate: 120, xPercent: 20, ease: 'none', scrollTrigger: { trigger: spin.parentElement, start: 'top top', end: 'bottom top', scrub: true } });

  // Decorative circles drift at their own speed while scrolling
  $$('[data-decor]').forEach((layer) => {
    const section = layer.parentElement!.closest('section') ?? layer.parentElement!;
    $$('.decor__item', layer).forEach((item) => {
      const speed = Number(item.dataset.speed) || 0;
      gsap.fromTo(
        item,
        { y: -speed * 160 },
        { y: speed * 160, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 0.6 } }
      );
    });
  });

  // Phones (deck not pinned): the whole stack tilts and rises as it scrolls past
  gsap.matchMedia().add('(max-width: 899px)', () => {
    $$('.deck__stack').forEach((stack) => {
      gsap.fromTo(stack, { rotation: -7, y: 50 }, { rotation: 5, y: -30, ease: 'none', scrollTrigger: { trigger: stack, start: 'top bottom', end: 'bottom top', scrub: 0.5 } });
    });
  });

  // Menu page: pizza cards rise and settle into their tilt as they scroll in
  $$('.pizza-card').forEach((card, i) => {
    gsap.fromTo(
      card,
      { y: 70, rotation: i % 2 ? 7 : -7, opacity: 0 },
      { y: 0, rotation: 0, opacity: 1, ease: 'none', clearProps: 'transform', scrollTrigger: { trigger: card, start: 'top bottom', end: 'top 72%', scrub: 0.5 } }
    );
  });

  const footerName = $('.footer__name');
  if (footerName) gsap.fromTo(footerName, { yPercent: 30 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true } });

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

/* --------------------------------------------------------------------------
   Big footer name sized to the container, whatever the name
   -------------------------------------------------------------------------- */
const footerName = $('.footer__name');
function fitFooterName() {
  if (!footerName) return;
  const container = footerName.parentElement!;
  const available = container.clientWidth - parseFloat(getComputedStyle(container).paddingLeft) * 2;
  footerName.style.fontSize = '100px';
  footerName.style.fontSize = `${Math.floor((available / footerName.scrollWidth) * 100 * 0.98)}px`;
}
fitFooterName();
window.addEventListener('resize', fitFooterName);
document.fonts?.ready.then(fitFooterName);

/* --------------------------------------------------------------------------
   Menu tabs (keyboard: arrows, Home, End)
   -------------------------------------------------------------------------- */
const tabs = $$<HTMLButtonElement>('[role="tab"]');
if (tabs.length) {
  const indicator = $('.tabs__indicator')!;
  const scroller = $('.tabs__scroller')!;
  const moveIndicator = (tab: HTMLElement) => {
    indicator.style.width = '1px';
    indicator.style.transform = `translateX(${tab.offsetLeft}px) scaleX(${tab.offsetWidth})`;
  };
  const selectTab = (tab: HTMLButtonElement, focus = true) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls')!)!;
      panel.hidden = !on;
      panel.classList.toggle('is-entering', on && !reduced);
    });
    if (focus) tab.focus();
    moveIndicator(tab);
    scroller.scrollTo({ left: tab.offsetLeft - (scroller.clientWidth - tab.offsetWidth) / 2, behavior: reduced ? 'auto' : 'smooth' });
    lenis?.resize();
    ScrollTrigger.refresh();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab, false));
    tab.addEventListener('keydown', (e) => {
      let next = -1;
      if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
      if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = tabs.length - 1;
      if (next >= 0) {
        e.preventDefault();
        selectTab(tabs[next]);
      }
    });
  });
  const place = () => moveIndicator(tabs.find((t) => t.getAttribute('aria-selected') === 'true')!);
  place();
  window.addEventListener('resize', place);
  document.fonts?.ready.then(place);
}

/* --------------------------------------------------------------------------
   Menu: filter pizzas by diet (all / vegetarian / vegan)
   -------------------------------------------------------------------------- */
$$('[data-filter]').forEach((group) => {
  const panel = group.closest('.menu-panel')!;
  const cards = $$<HTMLElement>('.pizza-card', panel);
  const status = $('[data-filter-status]', panel);
  const buttons = $$<HTMLButtonElement>('[data-filter-value]', group);
  buttons.forEach((btn) =>
    btn.addEventListener('click', () => {
      const value = btn.dataset.filterValue!;
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      let n = 0;
      cards.forEach((card) => {
        const show = !value || (card.dataset.diet ?? '').split(' ').includes(value);
        card.hidden = !show;
        card.classList.remove('is-in');
        if (show && !reduced) {
          card.style.setProperty('--n', String(n));
          void card.offsetWidth; // restart the entrance animation
          card.classList.add('is-in');
        }
        if (show) n++;
      });
      if (status) status.textContent = `${n} ${n === 1 ? 'pizza encontrada' : 'pizzas encontradas'}`;
      lenis?.resize();
      ScrollTrigger.refresh();
    })
  );
});

/* --------------------------------------------------------------------------
   FAQ: one answer open at a time, page height kept in sync
   -------------------------------------------------------------------------- */
const faqItems = $$<HTMLDetailsElement>('.faq__item');
faqItems.forEach((d) =>
  d.addEventListener('toggle', () => {
    if (d.open) faqItems.forEach((o) => o !== d && (o.open = false));
    lenis?.resize();
    ScrollTrigger.refresh();
  })
);

/* --------------------------------------------------------------------------
   Map: loads from Google only when asked
   -------------------------------------------------------------------------- */
$$('[data-map]').forEach((box) => {
  $('[data-map-load]', box)?.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = box.dataset.map!;
    iframe.title = box.dataset.mapTitle!;
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.allowFullscreen = true;
    box.replaceChildren(iframe);
    iframe.focus();
  });
});

/* --------------------------------------------------------------------------
   Cookie notice (remembered in localStorage, nothing else stored)
   -------------------------------------------------------------------------- */
const cookie = $('[data-cookie]');
let cookieDone = false;
try {
  cookieDone = !!localStorage.getItem('cookie-ok');
} catch {
  /* storage blocked: show the notice */
}
if (cookie && !cookieDone) {
  // On the home page it waits until the visitor has scrolled past the opening animation
  const heroEl = $('[data-hero]');
  if (!heroEl) cookie.hidden = false;
  else
    new IntersectionObserver(([e], obs) => {
      if (!e.isIntersecting) {
        cookie.hidden = false;
        obs.disconnect();
      }
    }).observe(heroEl);
}
$('[data-cookie-ok]')?.addEventListener('click', () => {
  try {
    localStorage.setItem('cookie-ok', '1');
  } catch {
    /* private mode: just hide it */
  }
  cookie!.hidden = true;
});

/* --------------------------------------------------------------------------
   Event enquiry form: validation, spam protection, confirmation
   -------------------------------------------------------------------------- */
const form = $<HTMLFormElement>('[data-quote-form]');
if (form) {
  const field = <T extends HTMLElement>(id: string) => $<T>(`#${id}`, form)!;
  const f = {
    name: field<HTMLInputElement>('q-name'),
    email: field<HTMLInputElement>('q-email'),
    phone: field<HTMLInputElement>('q-phone'),
    date: field<HTMLInputElement>('q-date'),
    guests: field<HTMLInputElement>('q-guests'),
    type: field<HTMLSelectElement>('q-type'),
    location: field<HTMLInputElement>('q-location'),
    consent: field<HTMLInputElement>('q-consent'),
    honeypot: field<HTMLInputElement>('q-website'),
  };
  const statusEl = $('[data-form-status]', form)!;
  const success = $('[data-form-success]')!;
  const submitLabel = $('[data-submit-label]', form)!;
  const startedAt = Date.now();

  const todayIso = new Date().toISOString().slice(0, 10);
  f.date.min = todayIso;

  // Preselect the event type when coming from an event card (?event=weddings)
  const preset = new URLSearchParams(location.search).get('evento');
  if (preset && [...f.type.options].some((o) => o.value === preset)) f.type.value = preset;

  const setError = (el: HTMLElement, msg: string) => {
    document.getElementById(`${el.id}-err`)!.textContent = msg;
    if (msg) el.setAttribute('aria-invalid', 'true');
    else el.removeAttribute('aria-invalid');
  };

  function validate() {
    const errors: [HTMLElement, string][] = [];
    if (f.name.value.trim().length < 2) errors.push([f.name, 'Digite seu nome.']);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.value.trim())) errors.push([f.email, 'Digite um e-mail válido, por exemplo nome@exemplo.com.']);
    const digits = f.phone.value.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 13) errors.push([f.phone, 'Digite um telefone com DDD, por exemplo (11) 90000-0000.']);
    if (!f.date.value) errors.push([f.date, 'Escolha a data da festa.']);
    else if (f.date.value < todayIso) errors.push([f.date, 'A data precisa ser hoje ou depois.']);
    const guests = Number(f.guests.value);
    if (!f.guests.value || !Number.isFinite(guests) || guests < 1) errors.push([f.guests, 'Informe mais ou menos quantos convidados.']);
    if (!f.type.value) errors.push([f.type, 'Escolha o tipo de evento.']);
    if (f.location.value.trim().length < 2) errors.push([f.location, 'Informe o local ou o CEP.']);
    if (!f.consent.checked) errors.push([f.consent, 'Marque a caixa para podermos responder.']);
    [f.name, f.email, f.phone, f.date, f.guests, f.type, f.location, f.consent].forEach((el) => setError(el, ''));
    errors.forEach(([el, msg]) => setError(el, msg));
    return errors;
  }

  form.addEventListener('input', (e) => {
    const el = e.target as HTMLElement;
    if (el.getAttribute('aria-invalid') === 'true') validate();
  });

  function showSuccess() {
    form!.hidden = true;
    success.hidden = false;
    success.focus();
    if (!reduced) gsap.fromTo(success, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: EASE });
    lenis?.resize();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errors = validate();
    if (errors.length) {
      statusEl.textContent = `Confira ${errors.length === 1 ? 'o campo destacado' : `os ${errors.length} campos destacados`}.`;
      errors[0][0].focus();
      return;
    }
    // Spam: bots fill the hidden field or submit in under 3 seconds. Pretend it worked.
    if (f.honeypot.value || Date.now() - startedAt < 3000) {
      showSuccess();
      return;
    }
    if (!data.endpoint) {
      // Design preview: nothing is sent
      showSuccess();
      return;
    }
    submitLabel.textContent = 'Enviando…';
    form.setAttribute('aria-busy', 'true');
    try {
      const res = await fetch(data.endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(String(res.status));
      showSuccess();
    } catch {
      statusEl.textContent = 'Não foi possível enviar. Tente de novo ou chame no WhatsApp.';
      submitLabel.textContent = 'Tentar de novo';
    } finally {
      form.removeAttribute('aria-busy');
    }
  });
}

/* --------------------------------------------------------------------------
   Desktop: cursor label over cards and magnetic buttons
   -------------------------------------------------------------------------- */
if (finePointer && !reduced) {
  document.documentElement.classList.add('has-cursor');
  const cursor = $('[data-cursor-el]')!;
  const label = $('[data-cursor-label]')!;
  const xTo = gsap.quickTo(cursor, 'x', { duration: 0.45, ease: 'power3.out' });
  const yTo = gsap.quickTo(cursor, 'y', { duration: 0.45, ease: 'power3.out' });
  window.addEventListener('pointermove', (e) => {
    xTo(e.clientX);
    yTo(e.clientY);
  });
  $$('[data-cursor]').forEach((el) => {
    el.addEventListener('pointerenter', () => {
      label.textContent = el.dataset.cursor!;
      cursor.classList.add('is-active');
    });
    el.addEventListener('pointerleave', () => cursor.classList.remove('is-active'));
  });
  $$('[data-magnetic]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.18}px ${(e.clientY - r.top - r.height / 2) * 0.28}px`;
    });
    el.addEventListener('pointerleave', () => (el.style.translate = '0 0'));
  });
}
