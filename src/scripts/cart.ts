/**
 * Pedido pelo WhatsApp (cardápio).
 * - Each item has an "Adicionar" button that turns into a − / quantity / + stepper
 * - The order is kept in localStorage, so it survives a reload or changing tabs
 * - A bar at the bottom shows items and total; it opens a native <dialog> (focus trap, Esc)
 * - "Enviar" builds one readable message and opens WhatsApp with it
 * Nothing here is needed to read the menu: without JavaScript the buttons simply do nothing.
 */
const KEY = 'pizzaria-pedido';
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

interface Line {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export function initCart(opts: { reduced: boolean }) {
  const dialog = document.querySelector<HTMLDialogElement>('[data-cart]');
  if (!dialog) return;
  const bar = document.querySelector<HTMLElement>('[data-cart-bar]')!;
  const form = dialog.querySelector<HTMLFormElement>('[data-cart-form]')!;
  const list = dialog.querySelector<HTMLElement>('[data-cart-list]')!;
  const empty = dialog.querySelector<HTMLElement>('[data-cart-empty]')!;
  const step1 = dialog.querySelector<HTMLElement>('[data-cart-step="1"]')!;
  const step2 = dialog.querySelector<HTMLElement>('[data-cart-step="2"]')!;
  const nextBtn = dialog.querySelector<HTMLButtonElement>('[data-cart-next]')!;
  const backBtn = dialog.querySelector<HTMLButtonElement>('[data-cart-back]')!;
  const clearBtn = dialog.querySelector<HTMLButtonElement>('[data-cart-clear]')!;
  const changeField = dialog.querySelector<HTMLElement>('[data-cart-change]')!;
  const address = dialog.querySelector<HTMLElement>('[data-cart-address]')!;
  const fee = dialog.querySelector<HTMLElement>('[data-cart-fee]')!;
  const send = dialog.querySelector<HTMLButtonElement>('[data-cart-send]')!;
  const controls = [...document.querySelectorAll<HTMLElement>('[data-cart-item]')];
  const wa = dialog.dataset.wa!;

  let lines: Line[] = [];
  let lastCount = -1;
  try {
    lines = JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    lines = [];
  }
  // drop items that are no longer on the menu, refresh names and prices
  const known = new Map(controls.map((c) => [c.dataset.cartItem!, c]));
  lines = lines.filter((l) => known.has(l.id) && l.qty > 0).map((l) => ({ ...l, name: known.get(l.id)!.dataset.name!, price: Number(known.get(l.id)!.dataset.price) }));

  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      /* private mode: the order just is not remembered */
    }
  };
  const qtyOf = (id: string) => lines.find((l) => l.id === id)?.qty ?? 0;
  const total = () => lines.reduce((t, l) => t + l.price * l.qty, 0);
  const count = () => lines.reduce((t, l) => t + l.qty, 0);

  function setQty(id: string, qty: number) {
    const el = known.get(id);
    if (!el) return;
    const line = lines.find((l) => l.id === id);
    if (qty <= 0) lines = lines.filter((l) => l.id !== id);
    else if (line) line.qty = qty;
    else lines.push({ id, name: el.dataset.name!, price: Number(el.dataset.price), qty });
    save();
    render();
  }

  const icon = (d: string) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`;
  const PLUS = icon('M12 5v14M5 12h14');
  const MINUS = icon('M5 12h14');
  const stepper = (id: string, name: string, qty: number) =>
    `<span class="stepper" data-stepper>
      <button type="button" class="stepper__btn" data-step="-1" data-id="${id}" aria-label="Tirar uma ${name}">${MINUS}</button>
      <span class="stepper__n" aria-live="polite"><span class="sr-only">${name}: </span>${qty}</span>
      <button type="button" class="stepper__btn" data-step="1" data-id="${id}" aria-label="Mais uma ${name}">${PLUS}</button>
    </span>`;

  function render() {
    // menu controls
    controls.forEach((el) => {
      const id = el.dataset.cartItem!;
      const q = qtyOf(id);
      const add = el.querySelector<HTMLElement>('[data-cart-add]')!;
      let st = el.querySelector<HTMLElement>('[data-stepper]');
      el.classList.toggle('is-picked', q > 0);
      if (q > 0) {
        const hadFocus = add.contains(document.activeElement);
        if (!st) {
          el.insertAdjacentHTML('beforeend', stepper(id, el.dataset.name!, q));
          st = el.querySelector<HTMLElement>('[data-stepper]')!;
        } else {
          st.querySelector('.stepper__n')!.innerHTML = `<span class="sr-only">${el.dataset.name}: </span>${q}`;
        }
        add.hidden = true;
        if (hadFocus) st.querySelector<HTMLButtonElement>('[data-step="1"]')!.focus();
      } else {
        const hadFocus = st?.contains(document.activeElement);
        st?.remove();
        add.hidden = false;
        if (hadFocus) add.focus();
      }
    });

    // bar
    const n = count();
    bar.querySelector('[data-cart-count]')!.textContent = String(n);
    bar.querySelector('[data-cart-total]')!.textContent = brl.format(total());
    bar.querySelector('.cart-bar__label')!.textContent = n === 1 ? 'Ver pedido · 1 item' : `Ver pedido · ${n} itens`;
    if (n > 0 && bar.hidden) {
      bar.hidden = false;
      requestAnimationFrame(() => bar.classList.add('is-on'));
    } else if (n === 0) {
      bar.classList.remove('is-on');
      bar.hidden = true;
    }
    document.body.classList.toggle('has-cart', n > 0);
    if (n > 0 && lastCount >= 0 && n !== lastCount && !opts.reduced) {
      bar.classList.remove('is-bump');
      void bar.offsetWidth;
      bar.classList.add('is-bump');
    }

    lastCount = n;

    // dialog
    list.innerHTML = lines
      .map(
        (l) => `<li class="cart__line">
          <div><p class="cart__name">${l.name}</p><p class="cart__unit">${brl.format(l.price)} cada</p></div>
          ${stepper(l.id, l.name, l.qty)}
          <p class="cart__line-total">${brl.format(l.price * l.qty)}</p>
        </li>`
      )
      .join('');
    empty.hidden = n > 0;
    nextBtn.disabled = n === 0;
    if (n === 0) showStep(1);
    dialog.querySelector('[data-cart-sum]')!.textContent = brl.format(total());
  }

  // steppers anywhere (menu and dialog), and the add buttons
  document.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const add = t.closest<HTMLElement>('[data-cart-add]');
    if (add) {
      const id = add.closest<HTMLElement>('[data-cart-item]')!.dataset.cartItem!;
      setQty(id, qtyOf(id) + 1);
      return;
    }
    const step = t.closest<HTMLElement>('[data-step]');
    if (step) {
      const id = step.dataset.id!;
      const inDialog = dialog.contains(step);
      setQty(id, qtyOf(id) + Number(step.dataset.step));
      // keep focus inside the dialog when a line disappears
      if (inDialog && !dialog.contains(document.activeElement)) dialog.querySelector<HTMLElement>('[data-cart-close]')!.focus();
    }
  });

  // two steps: review the items, then the customer's details
  function showStep(k: 1 | 2) {
    step1.hidden = k !== 1;
    step2.hidden = k !== 2;
    nextBtn.hidden = k !== 1;
    clearBtn.hidden = k !== 1;
    send.hidden = k !== 2;
    backBtn.hidden = k !== 2;
    dialog.querySelector('.cart__body')!.scrollTop = 0;
  }
  nextBtn.addEventListener('click', () => {
    showStep(2);
    dialog.querySelector<HTMLElement>('[data-cart-step2-title]')!.focus();
  });
  backBtn.addEventListener('click', () => {
    showStep(1);
    nextBtn.focus();
  });

  // open / close
  bar.querySelector('[data-cart-open]')!.addEventListener('click', () => {
    showStep(1);
    dialog.showModal();
    document.documentElement.classList.add('cart-open');
  });
  const close = () => dialog.close();
  dialog.querySelector('[data-cart-close]')!.addEventListener('click', close);
  dialog.addEventListener('close', () => document.documentElement.classList.remove('cart-open'));
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) close(); // click on the backdrop
  });
  dialog.querySelector('[data-cart-clear]')!.addEventListener('click', () => {
    lines = [];
    save();
    render();
  });

  // delivery or pickup
  const syncMode = () => {
    const pickup = (form.elements.namedItem('mode') as RadioNodeList).value === 'retirada';
    address.hidden = pickup;
    fee.textContent = pickup ? 'Retirada no balcão, sem taxa de entrega.' : 'Taxa de entrega combinada no WhatsApp.';
  };
  form.addEventListener('change', () => {
    syncMode();
    changeField.hidden = (form.elements.namedItem('pay') as HTMLSelectElement).value !== 'Dinheiro';
  });
  syncMode();

  // send
  // an error goes away as soon as the field is fixed
  form.addEventListener('input', (e) => {
    const f = e.target as HTMLInputElement;
    if (f.getAttribute('aria-invalid') === 'true' && f.value.trim()) {
      f.setAttribute('aria-invalid', 'false');
      document.getElementById(f.getAttribute('aria-describedby')!)!.textContent = '';
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!count()) return;
    const get = (n: string) => (form.elements.namedItem(n) as HTMLInputElement).value.trim();
    const input = (n: string) => form.elements.namedItem(n) as HTMLInputElement;
    const pickup = (form.elements.namedItem('mode') as RadioNodeList).value === 'retirada';
    const checks: [string, boolean, string][] = [
      ['name', !get('name'), 'Diga seu nome.'],
      ['phone', get('phone').replace(/\D/g, '').length < 10, 'Informe um telefone com DDD.'],
      ['street', !pickup && !get('street'), 'Informe a rua e o número.'],
      ['district', !pickup && !get('district'), 'Informe o bairro.'],
    ];
    let first: HTMLInputElement | null = null;
    checks.forEach(([n, bad, text]) => {
      const f = input(n);
      f.setAttribute('aria-invalid', String(bad));
      document.getElementById(f.getAttribute('aria-describedby')!)!.textContent = bad ? text : '';
      if (bad && !first) first = f;
    });
    if (first) {
      (first as HTMLInputElement).focus();
      return;
    }
    const pay = get('pay');
    const address = [get('street'), get('district')].filter(Boolean).join(', ') + (get('ref') ? ` (${get('ref')})` : '');
    const msg = [
      `🍕 *Novo pedido — ${dialog.dataset.store}*`,
      '',
      `*Nome:* ${get('name')}`,
      `*Telefone:* ${get('phone')}`,
      '',
      '*Pedido:*',
      ...lines.map((l) => `• ${l.qty}x ${l.name} — ${brl.format(l.price * l.qty)}`),
      '',
      `*Total:* ${brl.format(total())} (${pickup ? 'retirada no balcão' : 'sem taxa de entrega'})`,
      '',
      pickup ? '*Retirada:* no balcão' : `*Endereço de entrega:* ${address}`,
      `*Pagamento:* ${pay}${pay === 'Dinheiro' && get('change') ? ` (troco para ${get('change')})` : ''}`,
      ...(get('notes') ? [`*Observações:* ${get('notes')}`] : []),
    ].join('\n');
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });

  render();
}
