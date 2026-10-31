import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { initBag } from './bag';

gsap.registerPlugin(ScrollTrigger);

type Hours = { open: string; close: string } | null;
interface SiteData {
  hours: Hours[];
  timezone: string;
  whatsapp: string;
  gallery: string[];
  reservation: { slotMinutes: number; lastSlotBeforeClose: number };
  name: string;
}

const data: SiteData = JSON.parse(document.getElementById('site-data')!.textContent!);
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const EASE = 'expo.out'; // próximo de cubic-bezier(0.22, 1, 0.36, 1)
const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => [...root.querySelectorAll<T>(s)];

/* --------------------------------------------------------------------------
   Rolagem suave (Lenis) sincronizada com o ScrollTrigger
   -------------------------------------------------------------------------- */
let lenis: Lenis | null = null;
if (!reduced) {
  lenis = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 4) });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

function scrollToTarget(target: HTMLElement) {
  if (lenis) lenis.scrollTo(target, { offset: target.id === 'topo' ? 0 : -16 });
  else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  // leva o foco do teclado junto com a rolagem
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
}

document.addEventListener('click', (e) => {
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href')!.slice(1);
  const target = id ? document.getElementById(id) : null;
  if (!target) return;
  e.preventDefault();
  closeMenu(false);
  scrollToTarget(target);
  history.replaceState(null, '', `#${id}`);
});

/* --------------------------------------------------------------------------
   Horário (sempre no fuso do restaurante)
   -------------------------------------------------------------------------- */
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const hourLabel = (t: string) => {
  const [h, m] = t.split(':');
  if (t === '24:00') return 'midnight';
  const hh = Number(h) % 24;
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  const suffix = hh < 12 ? 'am' : 'pm';
  return m === '00' ? `${h12} ${suffix}` : `${h12}:${m} ${suffix}`;
};

function nowAtRestaurant() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: data.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    weekday: 'short',
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return {
    day: wd,
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
    iso: `${get('year')}-${get('month')}-${get('day')}`,
  };
}

function openStatus() {
  const now = nowAtRestaurant();
  const today = data.hours[now.day];
  if (today && now.minutes < toMin(today.open)) return { open: false, text: `Opens today at ${hourLabel(today.open)}` };
  if (today && now.minutes < toMin(today.close))
    return { open: true, text: `Open today until ${hourLabel(today.close)}` };
  for (let i = 1; i <= 7; i++) {
    const d = (now.day + i) % 7;
    const h = data.hours[d];
    if (h) return { open: false, text: `Closed now · opens ${i === 1 ? 'tomorrow' : DAY_NAMES[d]} at ${hourLabel(h.open)}` };
  }
  return { open: false, text: 'Fechado' };
}

function initHours() {
  const now = nowAtRestaurant();
  const status = $('[data-open-status]');
  if (status) {
    const s = openStatus();
    status.innerHTML = `<span class="status-dot${s.open ? ' is-open' : ''}" aria-hidden="true"></span>${s.text}`;
  }
  const row = $(`[data-hours] tr[data-day="${now.day}"]`);
  if (row) {
    row.classList.add('is-today');
    row.querySelector('th')!.insertAdjacentHTML('beforeend', '<span class="today-badge">Hoje</span>');
  }
}
initHours();

/* --------------------------------------------------------------------------
   Cabeçalho: fundo ao rolar, esconde ao descer, volta ao subir
   -------------------------------------------------------------------------- */
const header = $('[data-header]')!;
let lastY = window.scrollY;
let ticking = false;
function onScroll() {
  const y = window.scrollY;
  header.classList.toggle('is-scrolled', y > 40);
  const goingDown = y > lastY && y > 320;
  const menuOpen = document.documentElement.classList.contains('menu-open');
  header.classList.toggle('is-hidden', goingDown && !menuOpen);
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
   Menu móvel em tela cheia
   -------------------------------------------------------------------------- */
const menu = $('[data-menu]')!;
const menuBtn = $<HTMLButtonElement>('[data-menu-open]')!;
const mainAndFooter = $$('main, footer, .mobile-bar, .wa-float');

function openMenu() {
  menu.removeAttribute('inert');
  menu.classList.add('is-open');
  document.documentElement.classList.add('menu-open');
  menuBtn.setAttribute('aria-expanded', 'true');
  mainAndFooter.forEach((el) => el.setAttribute('inert', ''));
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
  mainAndFooter.forEach((el) => el.removeAttribute('inert'));
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
   Barra inferior (celular) e botão flutuante (desktop) depois do hero
   -------------------------------------------------------------------------- */
const hero = $('[data-hero]')!;
const bar = $('[data-mobile-bar]')!;
const waFloat = $('[data-wa-float]')!;
new IntersectionObserver(
  ([entry]) => {
    const past = !entry.isIntersecting && entry.boundingClientRect.top < 0;
    bar.classList.toggle('is-visible', past);
    waFloat.classList.toggle('is-visible', past);
  },
  { threshold: 0, rootMargin: '-35% 0px 0px 0px' }
).observe(hero);

/* --------------------------------------------------------------------------
   Animações de entrada
   -------------------------------------------------------------------------- */
function splitWords(el: HTMLElement) {
  const words = el.textContent!.trim().split(/\s+/);
  el.innerHTML = words.map((w) => `<span class="mask"><span>${w}</span></span>`).join(' ');
}

if (!reduced) {
  // Hero: zoom lento da foto e palavras subindo de trás da máscara (80 ms entre elas)
  const heroImg = $('.hero__img');
  if (heroImg) gsap.fromTo(heroImg, { scale: 1.1 }, { scale: 1, duration: 1.6, ease: 'power2.out' });
  const heroWords = $$('.hero [data-split] .mask > span');
  gsap.fromTo(heroWords, { y: '110%' }, { y: '0%', duration: 0.9, ease: EASE, stagger: 0.08, delay: 0.1 });
  gsap.fromTo('.hero__eyebrow, .hero__info', { opacity: 0 }, { opacity: 1, duration: 0.8, delay: 0.5, ease: 'power1.out' });

  $$('[data-split-auto]').forEach(splitWords);

  // O resto fica abaixo da dobra: os gatilhos de rolagem são montados depois que o hero
  // já começou, para não travar o carregamento. Sem `once`: o padrão já toca uma vez só,
  // e gatilhos que se destroem durante o refresh quebram o ScrollTrigger quando a página
  // abre já rolada (link com #âncora)
  if ('requestIdleCallback' in window) requestIdleCallback(setupScrollReveals, { timeout: 800 });
  else setTimeout(setupScrollReveals, 200);
}

function setupScrollReveals() {
  // Títulos de seção
  $$('[data-split-auto]').forEach((el) => {
    gsap.fromTo(
      $$('.mask > span', el),
      { y: '110%' },
      { y: '0%', duration: 0.9, ease: EASE, stagger: 0.06, scrollTrigger: { trigger: el, start: 'top 88%' } }
    );
  });

  // Fade + subida
  ScrollTrigger.batch('[data-reveal="fade"]', {
    start: 'top 90%',
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.8, ease: EASE, stagger: 0.08, overwrite: true }),
  });

  // Imagens: abertura de baixo para cima + zoom 1.15 → 1
  $$('[data-reveal="clip"]').forEach((el) => {
    const img = $('img', el);
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 90%' } });
    tl.to(el, { clipPath: 'inset(0% 0 0 0)', duration: 0.9, ease: 'power3.inOut' });
    if (img) tl.to(img, { scale: 1, duration: 1.2, ease: EASE }, 0);
  });

  // Cartões do cardápio visíveis no carregamento
  const firstCards = $$('.menu-panel:not([hidden]) .card, .menu-panel:not([hidden]) .menu-row');
  gsap.set(firstCards, { opacity: 0, y: 24 });
  ScrollTrigger.batch(firstCards, {
    start: 'top 92%',
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.8, ease: EASE, stagger: 0.08, clearProps: 'transform' }),
  });

  // Parallax sutil (no máximo ~12% do tamanho do elemento)
  $$('[data-parallax]').forEach((el) => {
    const amount = Number(el.dataset.parallax);
    gsap.fromTo(
      el,
      { yPercent: -amount / 2 },
      { yPercent: amount / 2, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }
    );
  });

  // Contadores
  $$('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count);
    const obj = { v: 0 };
    el.textContent = '0';
    gsap.to(obj, {
      v: target,
      duration: 1.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
      onUpdate: () => (el.textContent = Math.round(obj.v).toLocaleString('en-US')),
    });
  });

  // Nome gigante do rodapé
  gsap.fromTo('.footer__name', { yPercent: 18, opacity: 0.4 }, { yPercent: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true } });

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

/* --------------------------------------------------------------------------
   Nome do rodapé ocupando a largura útil, qualquer que seja o nome
   -------------------------------------------------------------------------- */
const footerName = $('.footer__name');
function fitFooterName() {
  if (!footerName) return;
  const container = footerName.parentElement!;
  const available = container.clientWidth - parseFloat(getComputedStyle(container).paddingLeft) * 2;
  footerName.style.fontSize = '100px';
  const natural = footerName.scrollWidth;
  footerName.style.fontSize = `${Math.floor((available / natural) * 100 * 0.98)}px`;
}
fitFooterName();
window.addEventListener('resize', fitFooterName);
document.fonts?.ready.then(fitFooterName);

/* --------------------------------------------------------------------------
   Abas do cardápio
   -------------------------------------------------------------------------- */
const tabs = $$<HTMLButtonElement>('[role="tab"]');
const indicator = $('.tabs__indicator')!;
const tabsBar = $('[data-tabs]')!;
const scroller = $('.tabs__scroller')!;

function moveIndicator(tab: HTMLElement) {
  indicator.style.width = '1px';
  indicator.style.transform = `translateX(${tab.offsetLeft}px) scaleX(${tab.offsetWidth})`;
}

function selectTab(tab: HTMLButtonElement, focus = true) {
  const current = tabs.find((t) => t.getAttribute('aria-selected') === 'true');
  if (current === tab) return;
  // posição do início da lista antes da troca (a altura do painel muda)
  const anchorY = window.scrollY + $('.menu-panels')!.getBoundingClientRect().top - tabsBar.offsetHeight - header.offsetHeight - 16;
  const wasPast = window.scrollY > anchorY;
  tabs.forEach((t) => {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    const panel = document.getElementById(t.getAttribute('aria-controls')!)!;
    panel.hidden = !on;
    panel.classList.toggle('is-entering', on && !reduced);
    if (on) $$('.card, .menu-row', panel).forEach((el) => ((el as HTMLElement).style.opacity = ''));
    if (on) gsap.set($$('.card, .menu-row', panel), { clearProps: 'opacity,transform' });
  });
  if (focus) tab.focus();
  moveIndicator(tab);
  // mantém a aba visível na barra rolável (celular)
  const left = tab.offsetLeft - (scroller.clientWidth - tab.offsetWidth) / 2;
  scroller.scrollTo({ left, behavior: reduced ? 'auto' : 'smooth' });
  // se a lista já tinha passado do topo, volta ao início da categoria
  lenis?.resize();
  ScrollTrigger.refresh();
  if (wasPast) lenis ? lenis.scrollTo(anchorY, { immediate: true }) : window.scrollTo({ top: anchorY });
}

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
const placeIndicator = () => moveIndicator(tabs.find((t) => t.getAttribute('aria-selected') === 'true')!);
placeIndicator();
window.addEventListener('resize', placeIndicator);
document.fonts?.ready.then(placeIndicator);

/* --------------------------------------------------------------------------
   Galeria + lightbox com teclado
   -------------------------------------------------------------------------- */
const lb = $<HTMLDialogElement>('[data-lightbox]')!;
const lbImg = $<HTMLImageElement>('[data-lightbox-img]', lb)!;
const lbCap = $('[data-lightbox-caption]', lb)!;
const lbCount = $('[data-lightbox-count]', lb)!;
const items = $$<HTMLButtonElement>('[data-lightbox-index]');
let lbIndex = 0;
let lbTrigger: HTMLElement | null = null;

function showLb(i: number) {
  lbIndex = (i + items.length) % items.length;
  const item = items[lbIndex];
  lbImg.src = item.dataset.full!;
  lbImg.alt = data.gallery[lbIndex];
  lbCap.textContent = data.gallery[lbIndex];
  lbCount.textContent = `${String(lbIndex + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
  // pré-carrega a vizinha
  const next = items[(lbIndex + 1) % items.length];
  new Image().src = next.dataset.full!;
}
items.forEach((item, i) =>
  item.addEventListener('click', () => {
    lbTrigger = item;
    showLb(i);
    lb.showModal();
    lenis?.stop();
  })
);
$('[data-lightbox-prev]', lb)!.addEventListener('click', () => showLb(lbIndex - 1));
$('[data-lightbox-next]', lb)!.addEventListener('click', () => showLb(lbIndex + 1));
$('[data-lightbox-close]', lb)!.addEventListener('click', () => lb.close());
lb.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') showLb(lbIndex + 1);
  if (e.key === 'ArrowLeft') showLb(lbIndex - 1);
});
lb.addEventListener('click', (e) => {
  if (e.target === lb || e.target === $('.lightbox__stage', lb)) lb.close();
});
lb.addEventListener('close', () => {
  lenis?.start();
  lbTrigger?.focus();
});
let touchX = 0;
lb.addEventListener('touchstart', (e) => (touchX = e.touches[0].clientX), { passive: true });
lb.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) showLb(lbIndex + (dx < 0 ? 1 : -1));
});

/* --------------------------------------------------------------------------
   Formulário de reserva → WhatsApp
   -------------------------------------------------------------------------- */
const form = $<HTMLFormElement>('[data-reserve-form]');
if (form) {
  const f = {
    name: $<HTMLInputElement>('#rs-name', form)!,
    phone: $<HTMLInputElement>('#rs-phone', form)!,
    people: $<HTMLSelectElement>('#rs-people', form)!,
    date: $<HTMLInputElement>('#rs-date', form)!,
    time: $<HTMLSelectElement>('#rs-time', form)!,
    notes: $<HTMLTextAreaElement>('#rs-notes', form)!,
  };
  const hint = $('[data-closed-hint]', form)!;
  const status = $('[data-form-status]', form)!;
  const today = nowAtRestaurant();
  f.date.min = today.iso;

  const weekdayOf = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).getDay();
  };
  const fmtDate = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  function fillTimes() {
    const iso = f.date.value;
    f.time.innerHTML = '';
    hint.textContent = '';
    if (!iso) {
      f.time.disabled = true;
      f.time.add(new Option('Choose a date first', ''));
      return;
    }
    const h = data.hours[weekdayOf(iso)];
    if (!h) {
      f.time.disabled = true;
      f.time.add(new Option('Closed on this day', ''));
      hint.textContent = `We're closed on ${DAY_NAMES[weekdayOf(iso)]}s. Please choose another date.`;
      return;
    }
    const { slotMinutes, lastSlotBeforeClose } = data.reservation;
    const minNow = iso === today.iso ? nowAtRestaurant().minutes + 30 : -1;
    const slots: string[] = [];
    for (let t = toMin(h.open); t <= toMin(h.close) - lastSlotBeforeClose; t += slotMinutes) {
      if (t >= minNow) slots.push(`${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`);
    }
    if (!slots.length) {
      f.time.disabled = true;
      f.time.add(new Option('No times left today', ''));
      hint.textContent = 'Today\'s times have passed. Please choose another date.';
      return;
    }
    f.time.disabled = false;
    f.time.add(new Option('Select', ''));
    slots.forEach((s) => f.time.add(new Option(hourLabel(s), s)));
  }
  f.date.addEventListener('change', () => {
    fillTimes();
    setError(f.date, '');
  });

  // Máscara leve de telefone: (73) 99999-9999
  f.phone.addEventListener('input', () => {
    const d = f.phone.value.replace(/\D/g, '').slice(0, 11);
    let out = d;
    if (d.length > 2) out = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length > 7) out = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
    f.phone.value = out;
  });

  function setError(el: HTMLElement, msg: string) {
    const err = document.getElementById(`${el.id}-err`)!;
    err.textContent = msg;
    if (msg) el.setAttribute('aria-invalid', 'true');
    else el.removeAttribute('aria-invalid');
  }

  function validate() {
    const errors: [HTMLElement, string][] = [];
    if (f.name.value.trim().length < 2) errors.push([f.name, 'Please enter your name.']);
    const digits = f.phone.value.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 11) errors.push([f.phone, 'Please enter a phone number with area code, e.g. (73) 99999-9999.']);
    if (!f.date.value) errors.push([f.date, 'Please choose a date.']);
    else if (f.date.value < today.iso) errors.push([f.date, 'Please choose today or a later date.']);
    else if (!data.hours[weekdayOf(f.date.value)]) errors.push([f.date, 'We\'re closed on this day. Please choose another date.']);
    if (f.date.value && !f.time.value && !f.time.disabled) errors.push([f.time, 'Please choose a time.']);
    else if (f.date.value && f.time.disabled && data.hours[weekdayOf(f.date.value)]) errors.push([f.date, 'No times available on this date. Please choose another.']);
    [f.name, f.phone, f.date, f.time].forEach((el) => setError(el, ''));
    errors.forEach(([el, msg]) => setError(el, msg));
    return errors;
  }

  [f.name, f.phone, f.time].forEach((el) =>
    el.addEventListener('blur', () => {
      if (el.getAttribute('aria-invalid') === 'true') validate();
    })
  );

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const errors = validate();
    if (errors.length) {
      status.textContent = `Please check the ${errors.length === 1 ? 'highlighted field' : `${errors.length} highlighted fields`}.`;
      errors[0][0].focus();
      return;
    }
    const people = f.people.value === '12+' ? '12 or more' : f.people.value;
    const lines = [
      `Hi! I'd like to book a table at ${data.name}.`,
      '',
      `Name: ${f.name.value.trim()}`,
      `Phone: ${f.phone.value.trim()}`,
      `Date: ${fmtDate(f.date.value)}`,
      `Time: ${hourLabel(f.time.value)}`,
      `Guests: ${people}`,
    ];
    if (f.notes.value.trim()) lines.push(`Notes: ${f.notes.value.trim()}`);
    const url = `https://wa.me/${data.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`;
    status.textContent = 'Opening WhatsApp with your message. Our team will confirm your reservation.';
    // com 'noopener' o window.open sempre devolve null; corta o vínculo depois
    const win = window.open(url, '_blank');
    if (win) win.opener = null;
    else window.location.href = url;
  });
}

initBag({ lenis, whatsapp: data.whatsapp, restaurantName: data.name, reduced });

/* --------------------------------------------------------------------------
   Desktop: cursor sobre imagens clicáveis e botões magnéticos
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
      const x = (e.clientX - r.left - r.width / 2) * 0.18;
      const y = (e.clientY - r.top - r.height / 2) * 0.28;
      el.style.translate = `${x}px ${y}px`;
    });
    el.addEventListener('pointerleave', () => (el.style.translate = '0 0'));
  });
}
