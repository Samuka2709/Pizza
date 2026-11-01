/** Card colours that rotate through the pizzas: black, wine and ivory, with a fine gold line (background / text / gold line) */
export const SWATCHES = [
  { bg: '#16110f', fg: '#f2e8d6', line: '#c9a45c', name: 'black' },
  { bg: '#4a1420', fg: '#f6ecdc', line: '#d4b46e', name: 'wine' },
  { bg: '#211a16', fg: '#f2e8d6', line: '#b8924f', name: 'smoke' },
  { bg: '#f2e8d6', fg: '#1a1411', line: '#a8853f', name: 'ivory' },
] as const;
export const swatch = (i: number) => SWATCHES[i % SWATCHES.length];
