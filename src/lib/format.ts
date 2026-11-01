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

export function whatsappLink(message = `Olá! Quero fazer um pedido na ${site.name}.`) {
  return `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const socialLinks = () =>
  (Object.entries(site.contact.social) as [string, string][])
    .filter(([, url]) => url)
    .map(([key, url]) => ({ key, url, label: key === 'tiktok' ? 'TikTok' : key[0].toUpperCase() + key.slice(1) }));
