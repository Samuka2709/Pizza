/** Card colours that rotate through the pizzas: muted, restaurant-menu palette (background / text / gold line) */
export const SWATCHES = [
  { bg: '#1f1814', fg: '#f4ecdf', line: '#c9a46a', name: 'charcoal' },
  { bg: '#fbf6ee', fg: '#241b16', line: '#a8844a', name: 'cream' },
  { bg: '#2e3a2b', fg: '#f4ecdf', line: '#c9a46a', name: 'olive' },
  { bg: '#4e1a15', fg: '#f6eadb', line: '#d3ad72', name: 'wine' },
] as const;
export const swatch = (i: number) => SWATCHES[i % SWATCHES.length];
