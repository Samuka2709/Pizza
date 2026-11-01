/**
 * URLs de imagem do Unsplash (CDN imgix): recorte, AVIF/WebP automático e srcset.
 * Para usar fotos próprias, troque apenas esta função.
 */
export function photoUrl(id: string, w: number, ratio: number, q = 70) {
  const h = Math.round(w / ratio);
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&crop=entropy&w=${w}&h=${h}&q=${q}`;
}

export function photoSrcset(id: string, ratio: number, widths: number[]) {
  return widths.map((w) => `${photoUrl(id, w, ratio)} ${w}w`).join(', ');
}

/** Own photos in public/: one WebP per width, named "<src>-<width>.webp" */
export const localUrl = (src: string, w: number) => `${src}-${w}.webp`;
export const localSrcset = (src: string, widths: number[]) => widths.map((w) => `${localUrl(src, w)} ${w}w`).join(', ');

/** Recorte da foto do hero: usado no <img> e no preload do <head>, que precisam bater */
export const heroImage = {
  ratio: 0.86,
  widths: [480, 720, 960, 1280, 1600, 2000],
  sizes: '(min-width: 900px) 64vw, 100vw',
};
