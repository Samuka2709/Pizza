import { restaurant } from '../data/restaurant';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
const usdCents = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** $13 for whole dollars, $2.50 otherwise */
export const price = (v: number) => (Number.isInteger(v) ? usd : usdCents).format(v);

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${restaurant.contact.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const genericOrderMessage = () => `Hi! I'd like to place an order at ${restaurant.fullName}.`;

export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** "18:00" → "6 pm", "18:30" → "6:30 pm" */
export function hourLabel(t: string) {
  const [h, m] = t.split(':');
  const hh = Number(h) % 24;
  const suffix = hh < 12 ? 'am' : 'pm';
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return m === '00' ? `${h12} ${suffix}` : `${h12}:${m} ${suffix}`;
}

export const instagramUrl = () => `https://instagram.com/${restaurant.contact.instagram}`;

export function fullAddress() {
  const a = restaurant.contact.address;
  return `${a.street} — ${a.district}, ${a.city} — ${a.state}`;
}

/** "6 pm to 11 pm" or "6 pm to midnight" */
export function rangeLabel(h: { open: string; close: string }) {
  return h.close === '24:00' || h.close === '00:00'
    ? `${hourLabel(h.open)} to midnight`
    : `${hourLabel(h.open)} to ${hourLabel(h.close)}`;
}
