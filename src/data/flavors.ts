/**
 * Sabores da seção "Gire a pizza" (home). Cada sabor é uma fatia da pizza desenhada.
 * nome, preço, descrição e ingredientes trocam quando a pizza gira.
 * `garnish`: tipo de cobertura desenhada na fatia e quantidade.
 * `base`: 'tomato' (molho vermelho) ou 'cream' (base branca).
 * Preços e textos são EXEMPLO.
 */
export interface Flavor {
  name: string;
  short: string;
  price: number;
  base: 'tomato' | 'cream';
  /** Foto real da cobertura usada na fatia (public/img/fatias/<tex>.webp) */
  tex: string;
  desc: string[];
  ing: [string, string][];
  garnish: [string, number][];
}

export const flavors: Flavor[] = [
  { name: 'Calabresa', tex: 'calabresa', short: 'CALABRESA', price: 49.9, base: 'tomato',
    desc: ['A preferida de quase todo mundo: calabresa fatiada e levemente tostada, cebola em rodelas e mussarela sobre um molho de tomate caseiro.',
      'Simples, farta e sem erro. É aquela pizza que agrada a mesa inteira e costuma ser a primeira a acabar.'],
    ing: [['Molho de tomate', '#d9361e'], ['Calabresa', '#b3261e'], ['Cebola', '#9b5c8f'], ['Mussarela', '#f6f1e4'], ['Orégano', '#5b7f3a']],
    garnish: [['chorizo', 11], ['oignon', 6]] },
  { name: 'Portuguesa', tex: 'portuguesa', short: 'PORTUGUESA', price: 54.9, base: 'tomato',
    desc: ['Presunto, ovo, cebola, azeitona e mussarela, tudo bem distribuído sobre o molho de tomate.',
      'Um clássico das pizzarias brasileiras, para quem gosta de uma pizza completa, com um pouco de tudo em cada pedaço.'],
    ing: [['Presunto', '#e8939a'], ['Ovo', '#f2c94c'], ['Cebola', '#9b5c8f'], ['Azeitona', '#2b2b2b'], ['Mussarela', '#f6f1e4']],
    garnish: [['jambon', 6], ['oeuf', 4], ['olive', 6], ['oignon', 4]] },
  { name: 'Margherita', tex: 'margherita', short: 'MARGHERITA', price: 47.9, base: 'tomato',
    desc: ['A mais simples e talvez a mais certeira: molho de tomate, mussarela de búfala e folhas de manjericão fresco.',
      'Um fio de azeite na saída do forno basta para lembrar por que ela continua sendo a referência de todas as pizzas.'],
    ing: [['Molho de tomate', '#d9361e'], ['Mussarela de búfala', '#f6f1e4'], ['Manjericão', '#3f8a2e'], ['Azeite', '#c9a227']],
    garnish: [['mozza', 7], ['basilic', 6]] },
  { name: 'Quatro queijos', tex: 'quatro-queijos', short: '4 QUEIJOS', price: 56.9, base: 'cream',
    desc: ['Mussarela, provolone, parmesão e gorgonzola se encontram numa combinação rica e cremosa, sem nada para distrair.',
      'Para quem gosta de queijo de verdade: melhor comer bem quente, quando cada pedaço sai puxando fio.'],
    ing: [['Mussarela', '#f6f1e4'], ['Provolone', '#f5d77a'], ['Parmesão', '#efe3c4'], ['Gorgonzola', '#7f9bb5']],
    garnish: [['chevre', 6], ['bleu', 7], ['emmental', 7]] },
  { name: 'Frango com catupiry', tex: 'frango', short: 'FRANGO', price: 52.9, base: 'cream',
    desc: ['Frango desfiado e temperado, coberto com catupiry cremoso e uma camada de mussarela.',
      'Macia, cremosa e reconfortante, é a escolha certa para quem quer uma pizza suave e bem servida.'],
    ing: [['Frango desfiado', '#d9b98a'], ['Catupiry', '#f6f1e4'], ['Mussarela', '#f6f1e4'], ['Milho', '#f2c94c']],
    garnish: [['frango', 14], ['catupiry', 6], ['milho', 12]] },
  { name: 'Havaiana', tex: 'havaiana', short: 'HAVAIANA', price: 51.9, base: 'tomato',
    desc: ['O doce e o salgado juntos: abacaxi em cubos, presunto e mussarela sobre um molho de tomate generoso.',
      'Divide opiniões, mas quem gosta defende com paixão, e quem tem dúvida costuma pedir mais um pedaço.'],
    ing: [['Molho de tomate', '#d9361e'], ['Presunto', '#e8939a'], ['Abacaxi', '#f4d35e'], ['Mussarela', '#f6f1e4']],
    garnish: [['ananas', 11], ['jambon', 7]] },
  { name: 'Vegetariana', tex: 'vegetariana', short: 'VEGETARIANA', price: 49.9, base: 'tomato',
    desc: ['Um jardim colorido sobre o molho de tomate: pimentões, champignon, azeitonas pretas e mussarela.',
      'Leve sem ser sem graça, mostra que uma pizza sem carne pode ser tão saborosa e caprichada quanto qualquer outra.'],
    ing: [['Molho de tomate', '#d9361e'], ['Pimentões', '#d8432b'], ['Champignon', '#b89a7a'], ['Azeitona', '#2b2b2b'], ['Mussarela', '#f6f1e4']],
    garnish: [['poivron', 8], ['champi', 6], ['olive', 7]] },
  { name: 'Salmão', tex: 'salmao', short: 'SALMÃO', price: 69.9, base: 'cream',
    desc: ['Base de cream cheese, lâminas de salmão defumado, cebolinha e raspas de limão para dar frescor.',
      'Delicada e diferente, agrada quem procura uma pizza mais leve, tanto no almoço quanto no jantar.'],
    ing: [['Cream cheese', '#efe3c4'], ['Salmão defumado', '#f08a6c'], ['Cebolinha', '#6aa84f'], ['Limão', '#f1d74b'], ['Mussarela', '#f6f1e4']],
    garnish: [['saumon', 8], ['aneth', 12], ['citron', 2]] },
];
