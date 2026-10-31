import { site } from '../data/site';

const gbp = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0, maximumFractionDigits: 0 });
const gbpPence = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** £10 for whole pounds, £5.50 otherwise */
export const price = (v: number) => (Number.isInteger(v) ? gbp : gbpPence).format(v);

export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** "17:00" → "5pm", "17:30" → "5.30pm" (British style) */
export function hourLabel(t: string) {
  const [h, m] = t.split(':');
  const hh = Number(h) % 24;
  const suffix = hh < 12 ? 'am' : 'pm';
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return m === '00' ? `${h12}${suffix}` : `${h12}.${m}${suffix}`;
}

export const popupTimes = () => `${hourLabel(site.popup.open)} to ${hourLabel(site.popup.close)}`;

export const mailto = (subject?: string) =>
  `mailto:${site.contact.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;

export const socialLinks = () =>
  (Object.entries(site.contact.social) as [string, string][])
    .filter(([, url]) => url)
    .map(([key, url]) => ({ key, url, label: key === 'tiktok' ? 'TikTok' : key[0].toUpperCase() + key.slice(1) }));
