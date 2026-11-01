import { site } from '../data/site';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** R$ 54,00 */
export const price = (v: number) => brl.format(v);

export const DAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

/** "19:00" → "19h", "19:30" → "19h30" */
export function hourLabel(t: string) {
  const [h, m] = t.split(':');
  return m === '00' ? `${Number(h)}h` : `${Number(h)}h${m}`;
}

export const popupTimes = () => `das ${hourLabel(site.popup.open)} às ${hourLabel(site.popup.close)}`;

export const mailto = (subject?: string) =>
  `mailto:${site.contact.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;

/** api.whatsapp.com (not wa.me): the wa.me redirect breaks emojis in the message */
export function whatsappLink(message = `Olá! Quero fazer um pedido na ${site.name}.`) {
  return `https://api.whatsapp.com/send?phone=${site.contact.whatsapp}&text=${encodeURIComponent(message)}`;
}

export const socialLinks = () =>
  (Object.entries(site.contact.social) as [string, string][])
    .filter(([, url]) => url)
    .map(([key, url]) => ({ key, url, label: key === 'tiktok' ? 'TikTok' : key[0].toUpperCase() + key.slice(1) }));

/** Days in the order people read a week: segunda first, domingo last */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

/** "18:00"–"23:00" → "18h às 23h"; null → "Fechado" */
export const hoursLabel = (h: [string, string] | null) => (h ? `${hourLabel(h[0])} às ${hourLabel(h[1])}` : 'Fechado');

/** Groups consecutive days with the same hours: "terça a quinta: 18h às 23h" */
export function hoursSummary() {
  const groups: { days: number[]; label: string }[] = [];
  for (const d of WEEK_ORDER) {
    const label = hoursLabel(site.hours[d]);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.days.push(d);
    else groups.push({ days: [d], label });
  }
  return groups.map((g) => {
    const a = DAYS[g.days[0]];
    const b = DAYS[g.days[g.days.length - 1]];
    const days = g.days.length === 1 ? a : g.days.length === 2 ? `${a} e ${b}` : `${a} a ${b}`;
    return { days: days[0].toUpperCase() + days.slice(1), label: g.label };
  });
}
