/**
 * Sabores da seção "Gire a pizza" (home). Um sabor por vez: a pizza inteira gira e dá lugar à próxima.
 * nome, preço, descrição e ingredientes trocam quando a pizza gira.
 * `img`: foto da pizza inteira em public/img/sabores/<img>.webp (gerada com IA, vista de cima).
 * Preços e textos são EXEMPLO.
 */
export interface Flavor {
  name: string;
  short: string;
  price: number;
  img: string;
  desc: string[];
  ing: [string, string][];
}

export const flavors: Flavor[] = [
  { name: 'Calabresa', img: 'calabresa', short: 'CALABRESA', price: 49.9,
    desc: ['A preferida de quase todo mundo: calabresa fatiada e levemente tostada, cebola em rodelas e mussarela sobre um molho de tomate caseiro.',
      'Simples, farta e sem erro. É aquela pizza que agrada a mesa inteira e costuma ser a primeira a acabar.'],
    ing: [['Molho de tomate', '#d9361e'], ['Calabresa', '#b3261e'], ['Cebola', '#9b5c8f'], ['Mussarela', '#f6f1e4'], ['Orégano', '#5b7f3a']] },
  { name: 'Portuguesa', img: 'portuguesa', short: 'PORTUGUESA', price: 54.9,
    desc: ['Presunto, ovo, cebola, azeitona e mussarela, tudo bem distribuído sobre o molho de tomate.',
      'Um clássico das pizzarias brasileiras, para quem gosta de uma pizza completa, com um pouco de tudo em cada pedaço.'],
    ing: [['Presunto', '#e8939a'], ['Ovo', '#f2c94c'], ['Cebola', '#9b5c8f'], ['Azeitona', '#2b2b2b'], ['Mussarela', '#f6f1e4']] },
  { name: 'Margherita', img: 'margherita', short: 'MARGHERITA', price: 47.9,
    desc: ['A mais simples e talvez a mais certeira: molho de tomate, mussarela de búfala e folhas de manjericão fresco.',
      'Um fio de azeite na saída do forno basta para lembrar por que ela continua sendo a referência de todas as pizzas.'],
    ing: [['Molho de tomate', '#d9361e'], ['Mussarela de búfala', '#f6f1e4'], ['Manjericão', '#3f8a2e'], ['Azeite', '#c9a227']] },
  { name: 'Quatro queijos', img: 'quatro-queijos', short: '4 QUEIJOS', price: 56.9,
    desc: ['Mussarela, provolone, parmesão e gorgonzola se encontram numa combinação rica e cremosa, sem nada para distrair.',
      'Para quem gosta de queijo de verdade: melhor comer bem quente, quando cada pedaço sai puxando fio.'],
    ing: [['Mussarela', '#f6f1e4'], ['Provolone', '#f5d77a'], ['Parmesão', '#efe3c4'], ['Gorgonzola', '#7f9bb5']] },
  { name: 'Frango com catupiry', img: 'frango', short: 'FRANGO', price: 52.9,
    desc: ['Frango desfiado e temperado, coberto com catupiry cremoso e uma camada de mussarela.',
      'Macia, cremosa e reconfortante, é a escolha certa para quem quer uma pizza suave e bem servida.'],
    ing: [['Frango desfiado', '#d9b98a'], ['Catupiry', '#f6f1e4'], ['Mussarela', '#f6f1e4'], ['Milho', '#f2c94c']] },
];
