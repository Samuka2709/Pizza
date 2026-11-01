/**
 * Arquivo único de conteúdo do site.
 * Textos, contatos, cardápio, eventos, perguntas frequentes e fotos vêm todos daqui:
 * para adaptar o site a um cliente, edite só este arquivo.
 *
 * Este é um SITE MODELO: marca, endereço, telefone, preços e textos marcados com
 * // EXEMPLO são fictícios e precisam ser trocados pelos dados reais do cliente.
 *
 * Fotos: fotos gratuitas do Unsplash usadas como ilustração (não são do cliente).
 * Troque o ID por outra foto do Unsplash (a parte depois de "photo-"), ou deixe `id`
 * vazio para mostrar um espaço reservado com legenda. Para fotos próprias, adapte `src/lib/img.ts`.
 */

export interface Photo {
  /** ID da foto no Unsplash. Vazio (e sem `src`) = espaço reservado */
  id: string;
  /** Foto própria em public/: caminho sem o fim "-<largura>.webp" (ex.: '/img/cardapio/brigadeiro') */
  src?: string;
  /** Texto alternativo descritivo (também vira a legenda do espaço reservado) */
  alt: string;
}

/** Marcadores de dieta mostrados no cardápio */
export type Diet = 'V' | 'VG' | 'GF' | 'N';

export interface MenuItem {
  name: string;
  description: string;
  price: number;
  diet?: Diet[];
  signature?: boolean;
  photo?: Photo;
}

export interface MenuGroup {
  id: string;
  label: string;
  note?: string;
  /** Texto curto acima da lista (pizzas) */
  intro?: { title: string; text: string; facts: string[] };
  /** Adicionais com preço (0 = troca sem custo) */
  extras?: { name: string; price: number }[];
  items: MenuItem[];
}

export const site = {
  name: 'Pizzaria', // EXEMPLO (nome do cliente)
  tagline: 'Massa de longa fermentação, forno quente e borda recheada.', // EXEMPLO
  city: 'Ilhéus', // EXEMPLO
  /** Domínio do cliente. Vazio = endereço da Vercel */
  siteUrl: '',
  timezone: 'America/Bahia',
  priceRange: '$$',

  /** Faixa no topo avisando que é um site modelo. Coloque false no site real. */
  mockupNotice: true,

  seo: {
    title: 'Pizzaria · pizzas artesanais, delivery e festas', // EXEMPLO
    description:
      'Pizzas artesanais no salão, no delivery e em festas: calabresa, portuguesa, frango com catupiry, pepperoni e pizzas doces. Peça pelo WhatsApp.', // EXEMPLO
  },

  contact: {
    phone: '(73) 0000-0000', // EXEMPLO
    phoneHref: '+557300000000', // EXEMPLO
    whatsapp: '557398258544', // número que recebe os pedidos (só números, com DDI e DDD)
    email: 'contato@exemplo.com.br', // EXEMPLO
    /** Redes sociais. Texto vazio esconde o link. */
    social: {
      instagram: 'https://www.instagram.com/', // EXEMPLO (endereço completo do perfil)
      facebook: 'https://www.facebook.com/', // EXEMPLO
      tiktok: '',
    },
    serviceArea: 'Centro de Ilhéus e bairros próximos', // EXEMPLO
  },

  /**
   * Horário de funcionamento (salão e delivery), de domingo (0) a sábado (6).
   * null = fechado. Horário de Brasília.
   */
  hours: [
    ['18:00', '23:00'], // domingo · EXEMPLO
    null, // segunda · EXEMPLO
    ['18:00', '23:00'], // terça · EXEMPLO
    ['18:00', '23:00'], // quarta · EXEMPLO
    ['18:00', '23:00'], // quinta · EXEMPLO
    ['18:00', '23:30'], // sexta · EXEMPLO
    ['18:00', '23:30'], // sábado · EXEMPLO
  ] as ([string, string] | null)[],

  /**
   * Formulário de orçamento. Com `endpoint` vazio ele funciona em modo demonstração:
   * valida, bloqueia spam e mostra a confirmação, mas não envia nada.
   * Um endpoint no estilo Formspree (POST, resposta JSON) faz o envio de verdade.
   */
  quoteForm: {
    endpoint: '',
    successTitle: 'Obrigado, recebemos seu pedido de orçamento.',
    successText: 'Respondemos em até um dia útil com a disponibilidade e um orçamento sob medida.', // EXEMPLO
  },

  nav: [
    { label: 'Cardápio', href: '/cardapio/' },
    { label: 'Festas e eventos', href: '/eventos/' },
    { label: 'Nossa história', href: '/nossa-historia/' },
    { label: 'Rodízio', href: '/rodizio/' },
    { label: 'Contato', href: '/contato/' },
  ],

  /* ------------------------------------------------------------------------
     Início
     ------------------------------------------------------------------------ */
  hero: {
    eyebrow: 'Pizzaria artesanal · delivery e salão', // EXEMPLO
  },

  marquee: ['Delivery', 'Rodízio de sexta', 'Aniversários', 'Festas em casa', 'Eventos de empresa', 'Borda recheada'],

  /**
   * Espaço para o vídeo da marca na página inicial. O quadro já está no layout:
   * coloque o arquivo de vídeo (MP4, 16:9) e uma foto de capa e ele aparece aqui.
   */
  film: {
    src: '',
    poster: { id: '1622880833523-7cf1c0bd4296', alt: 'Pizza assando no forno a lenha, com as chamas por cima' } as Photo,
    title: 'Do forno direto para a sua mesa.', // EXEMPLO
    text: 'Um vídeo curto sobre o forno, a massa e quem faz cada pizza. Em breve.', // EXEMPLO
  },

  intro: {
    label: 'O que fazemos',
    title: 'Pizza bem recheada, borda crocante e entrega rápida.', // EXEMPLO
    text: 'Massa que descansa por 48 horas, molho de tomate da casa e muito queijo. Peça no delivery, venha ao salão ou leve a pizzaria para a sua festa.', // EXEMPLO
  },

  /* ------------------------------------------------------------------------
     Festas e eventos
     ------------------------------------------------------------------------ */
  events: {
    title: 'Pizza para a sua festa, do jeito que você quer.', // EXEMPLO
    lead: 'Conte a data, o local e quantas pessoas. Respondemos com o cardápio e um orçamento fechado.', // EXEMPLO
    types: [
      {
        id: 'aniversarios',
        name: 'Aniversários',
        text: 'Rodízio de pizza em casa ou no salão de festas. Montamos o forno e servimos à vontade.', // EXEMPLO
        photo: { id: '1637270057940-921ced86faee', alt: 'Amigos em volta de uma mesa ao ar livre cheia de pizzas' },
      },
      {
        id: 'casamentos',
        name: 'Casamentos',
        text: 'Pizza na madrugada, quando a pista ainda está cheia. Um sucesso garantido com os convidados.', // EXEMPLO
        photo: { id: '1696263078099-ad603b242f90', alt: 'Noivos dividindo uma fatia de pizza' },
      },
      {
        id: 'empresas',
        name: 'Empresas',
        text: 'Confraternizações, happy hour e lançamentos, com nota fiscal e horário combinado.', // EXEMPLO
        photo: { id: '1639744210676-58da2cbee3d8', alt: 'Fatia de pizza sendo servida ao lado de um notebook' },
      },
      {
        id: 'escolas',
        name: 'Escolas',
        text: 'Festas juninas, formaturas e eventos da escola, com cardápio que a criançada adora.', // EXEMPLO
        photo: { id: '1598610089882-eddd72f7a039', alt: 'Duas meninas dividindo uma pizza num piquenique' },
      },
      {
        id: 'condominios',
        name: 'Condomínios',
        text: 'Noite da pizza no salão do prédio: levamos tudo e você só chama os vizinhos.', // EXEMPLO
        photo: { id: '1516697073-419b2bd079db', alt: 'Duas pizzas em caixas de papelão sobre a mesa' },
      },
    ] as { id: string; name: string; text: string; photo: Photo }[],
    steps: [
      { title: 'Conte sobre a festa', text: 'Envie o formulário com a data, o local e o número de convidados.' }, // EXEMPLO
      { title: 'Cardápio e orçamento', text: 'Sugerimos os sabores e mandamos um preço fechado, sem surpresas.' }, // EXEMPLO
      { title: 'A gente chega e assa', text: 'Chegamos antes, montamos o forno e servimos as pizzas quentinhas.' }, // EXEMPLO
      { title: 'Deixamos tudo limpo', text: 'Desmontamos e levamos tudo. Você só aproveita a festa.' }, // EXEMPLO
    ],
    faq: [
      {
        q: 'Para quantas pessoas vocês atendem?', // EXEMPLO
        a: 'A partir de 20 pessoas. Para festas grandes, levamos mais um forno e mais pizzaiolos.', // EXEMPLO
      },
      {
        q: 'Do que vocês precisam no local?', // EXEMPLO
        a: 'Um espaço de cerca de 3 por 3 metros, coberto ou ventilado, e uma tomada comum.', // EXEMPLO
      },
      {
        q: 'Tem opção vegetariana, vegana e sem glúten?', // EXEMPLO
        a: 'Sim. Sempre levamos sabores vegetarianos e veganos, e a massa sem glúten pode ser combinada com antecedência.', // EXEMPLO
      },
      {
        q: 'Vocês atendem fora da cidade?', // EXEMPLO
        a: 'Sim, com taxa de deslocamento calculada no orçamento.', // EXEMPLO
      },
      {
        q: 'Com quanta antecedência devo reservar?', // EXEMPLO
        a: 'Sábados disputados, como em dezembro e junho, saem rápido. Reserve com algumas semanas de antecedência.', // EXEMPLO
      },
      {
        q: 'Como funciona o pagamento?', // EXEMPLO
        a: 'Um sinal garante a data e o restante é pago no dia. Aceitamos Pix e cartão.', // EXEMPLO
      },
    ],
  },

  /* ------------------------------------------------------------------------
     Rodízio de sexta (página "Rodízio")
     ------------------------------------------------------------------------ */
  popup: {
    title: 'Toda sexta tem rodízio.',
    lead: 'Pizza à vontade no salão, salgadas e doces, saindo do forno sem parar. Chegue cedo, o salão enche.', // EXEMPLO
    /** 5 = sexta-feira. Horário de Brasília */
    weekday: 5,
    open: '19:00', // EXEMPLO
    close: '23:00', // EXEMPLO
    place: 'Rua de Exemplo, 123', // EXEMPLO
    addressLines: ['Rua de Exemplo, 123', 'Centro, Ilhéus, BA'], // EXEMPLO
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=-14.7958%2C-39.0345', // EXEMPLO
    mapsEmbed: 'https://www.google.com/maps?q=-14.7958,-39.0345&z=16&output=embed', // EXEMPLO (troque pelo endereço do cliente)
    gettingThere: [
      { title: 'A pé', text: 'No Centro histórico, a poucos minutos da Catedral de São Sebastião.' }, // EXEMPLO
      { title: 'De ônibus', text: 'Várias linhas param no Centro, perto da orla.' }, // EXEMPLO
      { title: 'De carro', text: 'Estacionamento conveniado na mesma rua.' }, // EXEMPLO
    ],
    notes: ['Pix, cartão e vale-refeição', 'Sabores vegetarianos e pizzas doces', 'Crianças até 6 anos não pagam'], // EXEMPLO
    photo: { id: '1564936281403-f92f66f89ee0', alt: 'Forno de pizza aceso à noite, com o fogo dentro' } as Photo,
  },

  /* ------------------------------------------------------------------------
     Nossa história
     ------------------------------------------------------------------------ */
  story: {
    title: 'Uma pizzaria de bairro, feita com capricho.', // EXEMPLO
    lead: 'Começamos com um forno, uma receita de família e vontade de fazer a pizza que a gente gosta de comer.', // EXEMPLO
    paragraphs: [
      'A ideia nasceu nas noites de domingo em família, quando a pizza era o centro da mesa e todo mundo tinha o seu sabor preferido.', // EXEMPLO
      'Fazemos a massa todos os dias e deixamos descansar por 48 horas, para ela ficar leve e crocante. O molho é da casa e o recheio vai até a borda.', // EXEMPLO
      'Hoje atendemos no salão, no delivery, em festas e no rodízio de sexta. A receita é a mesma desde o primeiro dia.', // EXEMPLO
    ],
    quote: 'Pizza boa é a que chega quentinha e faz todo mundo pedir mais uma fatia.', // EXEMPLO
    quoteBy: 'O fundador', // EXEMPLO
    values: [
      { title: 'Massa descansada', text: '48 horas de fermentação para uma massa leve e fácil de digerir.' }, // EXEMPLO
      { title: 'Recheio generoso', text: 'Ingredientes de verdade, do jeito que o brasileiro gosta: até a borda.' }, // EXEMPLO
      { title: 'Entrega rápida', text: 'Saiu do forno, saiu para a entrega, em caixa que mantém a pizza quente.' }, // EXEMPLO
    ],
    photos: [
      { id: '1537734796389-e1fc293cf856', alt: 'Mãos com farinha segurando uma bola de massa de pizza' },
      { id: '1693307090398-2a6d5cc39c77', alt: 'Pizza na pá dentro do forno, iluminada pelas chamas' },
    ] as Photo[],
  },

  /* ------------------------------------------------------------------------
     Cardápio (preços em reais)
     ------------------------------------------------------------------------ */
  menu: [
    {
      id: 'pizzas',
      label: 'Pizzas salgadas',
      note: 'Pizza grande, 8 fatias. Todas podem vir com borda recheada.', // EXEMPLO
      intro: {
        title: 'Massa de 48 horas, forno bem quente e recheio até a borda.', // EXEMPLO
        text: 'Nossa massa descansa por dois dias para ficar leve e crocante. Cada pizza é aberta na hora e assada em forno de pedra.', // EXEMPLO
        facts: ['Massa de 48h', 'Forno de pedra', '8 fatias'], // EXEMPLO
      },
      extras: [
        { name: 'Borda de catupiry', price: 12 }, // EXEMPLO
        { name: 'Borda de cheddar', price: 12 }, // EXEMPLO
        { name: 'Borda de chocolate', price: 14 }, // EXEMPLO
        { name: 'Meio a meio', price: 0 }, // EXEMPLO
      ],
      items: [
        { name: 'Calabresa', description: 'Molho de tomate, mussarela, calabresa fatiada e cebola.', price: 54, signature: true, photo: { id: '1655673654158-9f7285b7d1ea', alt: 'Pizza de calabresa com cebola e tomate' } }, // EXEMPLO
        { name: 'Marguerita', description: 'Mussarela, rodelas de tomate, manjericão e orégano.', price: 52, diet: ['V'], photo: { id: '1576458088443-04a19bb13da6', alt: 'Pizza com rodelas de tomate, azeitona e orégano' } }, // EXEMPLO
        { name: 'Portuguesa', description: 'Presunto, ovo, cebola, azeitona, ervilha e mussarela.', price: 62, signature: true, photo: { id: '1571066811602-716837d681de', alt: 'Pizza portuguesa com ovo, azeitona e presunto' } }, // EXEMPLO
        { name: 'Frango com catupiry', description: 'Frango desfiado temperado, catupiry e milho.', price: 60, signature: true, photo: { id: '1618213837799-25d5552820d3', alt: 'Pizza de frango com requeijão cremoso e azeitona' } }, // EXEMPLO
        { name: 'Pepperoni', description: 'Molho de tomate, mussarela e muito pepperoni.', price: 64, photo: { id: '1534308983496-4fabb1a015ee', alt: 'Pizza de pepperoni com mussarela derretida' } }, // EXEMPLO
        { name: 'Quatro queijos', description: 'Mussarela, provolone, parmesão e catupiry.', price: 60, diet: ['V'], photo: { id: '1604917869287-3ae73c77e227', alt: 'Pizza de quatro queijos dourada' } }, // EXEMPLO
        { name: 'Toscana', description: 'Linguiça toscana moída, cebola e mussarela.', price: 58, photo: { id: '1750680230007-055ecc622c94', alt: 'Pizza de linguiça numa pá de madeira sobre toalha xadrez' } }, // EXEMPLO
        { name: 'Picanha com cheddar', description: 'Tiras de picanha, cheddar cremoso e cebola caramelizada.', price: 72, photo: { id: '1694630716997-83f42bf92267', alt: 'Pizza com tiras de carne e pedaços de linguiça' } }, // EXEMPLO
      ],
    },
    {
      id: 'doces',
      label: 'Pizzas doces',
      items: [
        { name: 'Brigadeiro', description: 'Chocolate ao leite e granulado.', price: 48, diet: ['V'], signature: true, photo: { id: '', src: '/img/cardapio/brigadeiro', alt: 'Pizza de brigadeiro com granulado, cortada em fatias' } }, // EXEMPLO
        { name: 'Romeu e Julieta', description: 'Goiabada cremosa e queijo minas.', price: 46, diet: ['V'], photo: { id: '', src: '/img/cardapio/romeu-e-julieta', alt: 'Pizza de goiabada com queijo minas, cortada em fatias' } }, // EXEMPLO
        { name: 'Banana com canela', description: 'Banana, açúcar, canela e leite condensado.', price: 44, diet: ['V'], photo: { id: '', src: '/img/cardapio/banana-com-canela', alt: 'Pizza de banana com canela e leite condensado, cortada em fatias' } }, // EXEMPLO
      ],
    },
    {
      id: 'bebidas',
      label: 'Bebidas e porções',
      items: [
        { name: 'Refrigerante 2 litros', description: 'Coca-Cola, Guaraná ou Fanta.', price: 14, diet: ['VG', 'GF'], photo: { id: '', src: '/img/cardapio/refrigerante', alt: 'Garrafa de refrigerante gelada e dois copos com gelo' } }, // EXEMPLO
        { name: 'Suco natural 1 litro', description: 'Laranja, limão ou maracujá.', price: 16, diet: ['VG', 'GF'], photo: { id: '', src: '/img/cardapio/suco-natural', alt: 'Jarra e copo de suco de laranja com gelo' } }, // EXEMPLO
        { name: 'Batata frita recheada', description: 'Porção de batata frita coberta com cheddar cremoso e bacon.', price: 32, photo: { id: '', src: '/img/cardapio/batata-frita', alt: 'Batata frita recheada com cheddar e bacon na frigideira' } }, // EXEMPLO
      ],
    },
  ] as MenuGroup[],

  /** Quadros de destaque na página do cardápio */
  menuCallouts: [
    { title: 'Massa sem glúten', text: 'Disponível para qualquer sabor, sob encomenda. Feita na mesma cozinha, não indicada para celíacos.' }, // EXEMPLO
    { title: 'Meio a meio', text: 'Escolha dois sabores na mesma pizza, sem custo a mais. Vale o preço do sabor mais caro.' }, // EXEMPLO
    { title: 'Retirada no balcão', text: 'Peça pelo WhatsApp e retire no horário combinado, sem fila e sem taxa de entrega.' }, // EXEMPLO
  ],

  dietKey: [
    { code: 'V', label: 'Vegetariana' },
    { code: 'VG', label: 'Vegana' },
    { code: 'GF', label: 'Sem glúten' },
    { code: 'N', label: 'Contém castanhas' },
  ] as { code: Diet; label: string }[],

  /* ------------------------------------------------------------------------
     Galeria e fotos
     ------------------------------------------------------------------------ */
  gallery: [
    { id: '1604382354936-07c5d9983bd3', alt: 'Pizza de linguiça com azeitona e pimentão, vista de cima', span: 'tall' },
    { id: '1622883618971-97068745dc6c', alt: 'Pessoa segurando uma pizza na caixa de entrega', span: '' },
    { id: '1516697073-419b2bd079db', alt: 'Duas pizzas em caixas de papelão, prontas para comer', span: 'wide' },
    { id: '1576458087875-4d52fc51e013', alt: 'Pizza com azeitona e tomate, fatiada', span: '' },
    { id: '1710575326152-4a397c13716d', alt: 'Mãos abrindo a massa da pizza na bancada', span: '' },
    { id: '1599462620592-8e17c48eed70', alt: 'Quatro pizzas em caixas de entrega, vistas de cima', span: '' },
  ] as (Photo & { span: '' | 'tall' | 'wide' })[],

  footer: {
    copyright: 'Pizzaria', // EXEMPLO
  },
};

export type Site = typeof site;
