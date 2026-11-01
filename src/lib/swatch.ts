/** Card colours that rotate through the pizzas: muted, restaurant-menu palette (background / text / gold line) */
export const SWATCHES = [
  { bg: '#24231f', fg: '#f5ebdd', line: '#c9a46a', name: 'charcoal' },
  { bg: '#faf4ea', fg: '#24231f', line: '#a8844a', name: 'cream' },
  { bg: '#173d2d', fg: '#f5ebdd', line: '#c9a46a', name: 'olive' },
  { bg: '#7e2b20', fg: '#f6eadb', line: '#d3ad72', name: 'wine' },
] as const;
export const swatch = (i: number) => SWATCHES[i % SWATCHES.length];
