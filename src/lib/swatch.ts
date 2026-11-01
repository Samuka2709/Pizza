/** Card colours that rotate through the pizzas (background / text) */
export const SWATCHES = [
  { bg: '#b7321d', fg: '#fffdf8', name: 'tomato' },
  { bg: '#3b5a34', fg: '#fffdf8', name: 'basil' },
  { bg: '#e2a93b', fg: '#241b16', name: 'mustard' },
  { bg: '#8fb0dd', fg: '#241b16', name: 'sky' },
] as const;
export const swatch = (i: number) => SWATCHES[i % SWATCHES.length];
