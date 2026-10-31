/**
 * Single configuration file for the site.
 * All copy, contact info, hours, prices and photos come from here.
 * To switch clients, edit only this file.
 *
 * Values marked // DEMO are placeholder data and must be replaced
 * with the client's real data before publishing.
 *
 * Prices are in US dollars (see `src/lib/format.ts`).
 *
 * Photos: IDs of free Unsplash photos (https://unsplash.com/photos/...).
 * Swap for another Unsplash ID or adapt `src/lib/img.ts`
 * to point to the restaurant's own photos.
 */

export type Tag = 'Best seller' | 'New' | 'Spicy' | 'Vegetarian';

export interface Photo {
  /** Unsplash photo ID (the part after "photo-") */
  id: string;
  /** Descriptive, unique alt text */
  alt: string;
}

export interface Dish {
  name: string;
  description: string;
  price: number;
  pieces?: string;
  tags?: Tag[];
  photo?: Photo;
}

export interface MenuCategory {
  id: string;
  label: string;
  /** Dishes with a photo (4:5 cards) */
  featured: Dish[];
  /** Other items in the category, as a text list */
  more?: Dish[];
}

/** 0 = Sunday ... 6 = Saturday. null = closed. Times in "HH:MM" (restaurant time zone). */
export type Hours = { open: string; close: string } | null;

export const restaurant = {
  name: 'Sushi American', // DEMO
  fullName: 'Sushi American', // DEMO
  tagline: 'Generous rolls, real crunch, sauce just right.', // DEMO
  city: 'Ilhéus', // DEMO
  neighborhood: 'Pontal', // DEMO
  /** Client's own domain. Empty = uses the Vercel production URL. */
  siteUrl: '', // DEMO (e.g. 'https://sushiamerican.com')
  timezone: 'America/Bahia', // DEMO
  foundedYear: 2014, // DEMO
  priceRange: '$$',

  seo: {
    title: 'Sushi American — American-style sushi rolls in Ilhéus', // DEMO
    description:
      'American-style sushi in Pontal, Ilhéus: hot rolls, California, Dragon, Rainbow and Spicy tuna. Order on WhatsApp and book a table online.', // DEMO
  },

  contact: {
    whatsapp: '5573998258544', // DEMO (digits only, with country and area code)
    phone: '+55 73 3231-0000', // DEMO
    phoneHref: '+557332310000', // DEMO
    instagram: 'sushiamerican', // DEMO (without @)
    address: {
      street: 'Av. Lomanto Júnior, 1200', // DEMO
      district: 'Pontal', // DEMO
      city: 'Ilhéus', // DEMO
      state: 'BA', // DEMO
      zip: '45654-000', // DEMO
      country: 'BR',
    },
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Av.+Lomanto+J%C3%BAnior%2C+1200+-+Pontal%2C+Ilh%C3%A9us+-+BA', // DEMO
    mapsEmbed:
      'https://www.google.com/maps?q=Av.+Lomanto+J%C3%BAnior,+1200+-+Pontal,+Ilh%C3%A9us+-+BA&output=embed', // DEMO
  },

  /** Index 0 = Sunday */
  hours: [
    { open: '12:00', close: '22:00' }, // DEMO Sunday
    null, // DEMO Monday (closed)
    { open: '18:00', close: '23:00' }, // DEMO Tuesday
    { open: '18:00', close: '23:00' }, // DEMO Wednesday
    { open: '18:00', close: '23:00' }, // DEMO Thursday
    { open: '18:00', close: '24:00' }, // DEMO Friday
    { open: '18:00', close: '24:00' }, // DEMO Saturday
  ] as Hours[],

  /** Real Google reviews. Leave null to hide the social proof section. */
  google: null as null | {
    rating: number;
    count: number;
    url: string;
    reviews: { author: string; text: string }[];
  },

  nav: [
    { label: 'About', href: '#sobre' },
    { label: 'Menu', href: '#cardapio' },
    { label: 'Combos', href: '#combos' },
    { label: 'Gallery', href: '#galeria' },
    { label: 'Reservations', href: '#reservas' },
    { label: 'Contact', href: '#contato' },
  ],

  hero: {
    photo: {
      id: '1710945301326-d60727e4833a',
      alt: 'Salmon niguiri lifted by chopsticks against a black background, with side light on the fish',
    },
  },

  marquee: ['Hot rolls fried to order', 'House-made sauces', 'California, Dragon and Rainbow', 'Fresh fish every day'], // DEMO

  about: {
    label: 'Our story',
    title: 'The sushi we fell for abroad, made right here.', // DEMO
    paragraphs: [
      'Sushi American was born in 2014 after a trip along the US West Coast, where sushi picked up cream cheese, avocado, tempura and spicy sauces. We came back with one idea: serve those rolls here in Pontal.', // DEMO
      'Every roll is made to order, with rice seasoned in house and fish that arrives every morning. Hot rolls go straight from the fryer to your table, and our sauces (tarê, spicy mayo and sriracha) are all made here.', // DEMO
    ],
    photos: [
      {
        id: '1711991022613-63df8929f311',
        alt: 'Itamae’s hands slicing a salmon loin with a yanagiba knife on a wooden board',
      },
      {
        id: '1681270496598-13c5365730c8',
        alt: 'Chef finishing a plate with long chopsticks, close-up over the wooden counter',
      },
    ] as Photo[],
    pillars: [
      { title: 'Fresh fish', text: 'Salmon, tuna and white fish delivered every morning by suppliers we know personally.' }, // DEMO
      { title: 'Crunch', text: 'Light tempura, fried the moment you order. Nothing sits waiting on the counter.' }, // DEMO
      { title: 'House sauces', text: 'Tarê, spicy mayo, sriracha and ponzu, made here in small batches.' }, // DEMO
    ],
    stats: [
      { value: 12, suffix: '', label: 'years open' }, // DEMO
      { value: 400, suffix: '', label: 'hot rolls a night' }, // DEMO
      { value: 14, suffix: '', label: 'rolls on the menu' }, // DEMO
    ],
  },

  /** Order built in the site's bag and sent as a WhatsApp message */
  order: {
    payment: ['Card on delivery', 'Cash', 'Pix'], // DEMO
    deliveryNote: 'The delivery fee depends on your neighborhood and is confirmed on WhatsApp.', // DEMO
  },

  /** Short titles and copy for each section */
  sections: {
    heroEyebrow: 'American-style sushi', // DEMO
    menu: {
      title: 'Rolls, crunch and the classics.', // DEMO
      lead: 'Prices per portion. Build your order here and send it all at once on WhatsApp.',
    },
    combos: {
      title: 'Made for sharing.', // DEMO
      lead: 'Ready-made platters, put together to order for pickup or delivery.', // DEMO
    },
    gallery: { title: 'Up close, no rush.' }, // DEMO
    visit: { title: 'In Pontal, by the sea.' }, // DEMO
  },

  signature: {
    label: 'Chef’s signature',
    priceNote: 'serves 2', // DEMO
    cta: 'Order the boat',
    kanji: '巻',
    name: 'American Boat', // DEMO
    description:
      'A sushi boat with the best of the house: hot roll, Dragon, Rainbow, Spicy tuna crunch and California, with our three house sauces on the side.', // DEMO
    details: ['40 pieces', '5 American rolls', '3 house sauces'], // DEMO
    price: 49, // DEMO
    photo: {
      id: '1635451778386-e5778e66f61e',
      alt: 'A single niguiri on a round dark stone plate, lit from the side on a wooden counter',
    },
    detail: {
      id: '1763943431214-275e64002f90',
      alt: 'Close-up of tuna niguiris with ginger and wasabi on a light wooden board',
    },
  },

  menu: [
    {
      id: 'americanos',
      label: 'American rolls',
      featured: [
        {
          name: 'Hot roll',
          description: 'Salmon and cream cheese, breaded, fried to order and finished with tarê.',
          pieces: '10 pieces',
          price: 13, // DEMO
          tags: ['Best seller'],
          photo: { id: '1761315413078-1fd73894fe0e', alt: 'Golden breaded hot roll held by chopsticks against a dark green background' },
        },
        {
          name: 'Spicy tuna crunch',
          description: 'Spicy tuna, sriracha mayo, tempura flakes and fish roe.',
          pieces: '8 pieces',
          price: 15, // DEMO
          tags: ['Spicy', 'New'],
          photo: { id: '1787589481636-a69533c81edb', alt: 'Rolls topped with orange fish roe and a drizzle of spicy mayo on a light plate' },
        },
        {
          name: 'Rainbow roll',
          description: 'California roll topped with salmon, tuna, white fish and avocado.',
          pieces: '8 pieces',
          price: 16, // DEMO
          photo: { id: '1563245370-cd55e7c95ff4', alt: 'Colorful rolls with assorted fish toppings, seen from above on a dark board' },
        },
      ],
      more: [
        { name: 'California', description: 'Kani, mango, cucumber and sesame on the outside.', pieces: '8 pieces', price: 10 }, // DEMO
        { name: 'Dragon roll', description: 'Tempura shrimp and cucumber, topped with avocado and tarê.', pieces: '8 pieces', price: 16 }, // DEMO
        { name: 'Veggie crunch', description: 'Avocado, cucumber, carrot and tempura flakes.', pieces: '8 pieces', price: 9, tags: ['Vegetarian'] }, // DEMO
      ],
    },
    {
      id: 'combinados',
      label: 'Platters',
      featured: [
        {
          name: 'Kuro platter',
          description: 'Niguiris, uramakis and hossomakis of the day, chosen by the chef.',
          pieces: '16 pieces',
          price: 25, // DEMO
          photo: { id: '1617196034796-73dfa7b1fd56', alt: 'Row of assorted niguiris on a square black slate plate' },
        },
        {
          name: 'Seared salmon platter',
          description: 'Torched salmon niguiris and sesame uramakis.',
          pieces: '18 pieces',
          price: 28, // DEMO
          tags: ['Best seller'],
          photo: { id: '1583623025817-d180a2221d0a', alt: 'Seared salmon niguiris with sesame next to uramakis and soy sauce on dark stone' },
        },
        {
          name: 'Gunkan platter',
          description: 'Fish roe gunkans, tamago and white fish niguiris.',
          pieces: '14 pieces',
          price: 26, // DEMO
          tags: ['New'],
          photo: { id: '1514190051997-0f6f39ca5cde', alt: 'Fish roe gunkans and tamago niguiris lined up on a green leaf' },
        },
      ],
      more: [
        { name: 'Vegetarian platter', description: 'Cucumber, avocado, shiitake and tamago.', pieces: '16 pieces', price: 19, tags: ['Vegetarian'] }, // DEMO
        { name: 'Kids platter', description: 'Hossomakis and uramakis, nothing raw.', pieces: '12 pieces', price: 15 }, // DEMO
      ],
    },
    {
      id: 'sashimis',
      label: 'Sashimi',
      featured: [
        {
          name: 'Salmon sashimi',
          description: 'Thick cut, served with freshly grated wasabi.',
          pieces: '10 slices',
          price: 18, // DEMO
          tags: ['Best seller'],
          photo: { id: '1675870791718-a12568cfef43', alt: 'Thick slice of salmon sashimi lifted by chopsticks against a dark background' },
        },
        {
          name: 'Moriawase',
          description: 'Salmon, tuna, white fish and shrimp of the day.',
          pieces: '15 slices',
          price: 27, // DEMO
          photo: { id: '1772285283419-b34f42b4a4df', alt: 'Selection of salmon, tuna and white fish sashimi arranged on a dark plate' },
        },
        {
          name: 'House trio',
          description: 'Salmon, tuna and shrimp, with a complimentary niguiri.',
          pieces: '12 slices',
          price: 22, // DEMO
          photo: { id: '1791386809533-5c2e79e34665', alt: 'Salmon, tuna and shrimp sashimi and niguiris on a black plate' },
        },
      ],
      more: [
        { name: 'White fish sashimi', description: 'With citrus ponzu and scallions.', pieces: '10 slices', price: 16 }, // DEMO
        { name: 'Tuna sashimi', description: 'Red tuna in rectangular cuts.', pieces: '8 slices', price: 20 }, // DEMO
      ],
    },
    {
      id: 'niguiris',
      label: 'Niguiri',
      featured: [
        {
          name: 'Salmon niguiri',
          description: 'Warm rice and diagonally cut salmon.',
          pieces: '2 pieces',
          price: 6, // DEMO
          photo: { id: '1637074930269-089fde202b57', alt: 'Two salmon niguiris on a black plate, with chopsticks resting beside them' },
        },
        {
          name: 'Torched salmon',
          description: 'Seared with a torch and brushed with house tarê.',
          pieces: '2 pieces',
          price: 7, // DEMO
          tags: ['New'],
          photo: { id: '1711480023277-9f27496f10e6', alt: 'Itamae brushing tarê sauce over a freshly torched niguiri' },
        },
        {
          name: 'Tuna niguiri',
          description: 'Fresh akami with a touch of wasabi.',
          pieces: '2 pieces',
          price: 8, // DEMO
          photo: { id: '1562707786-7d2b807961c4', alt: 'Red tuna niguiris garnished with scallions, close-up' },
        },
      ],
      more: [
        { name: 'White fish with yuzu', description: 'Citrus zest and coarse salt.', pieces: '2 pieces', price: 7 }, // DEMO
        { name: 'Ebi', description: 'Cooked shrimp, butterflied.', pieces: '2 pieces', price: 7 }, // DEMO
        { name: 'Tamago', description: 'Sweet Japanese omelet, made in house.', pieces: '2 pieces', price: 5, tags: ['Vegetarian'] }, // DEMO
      ],
    },
    {
      id: 'temakis',
      label: 'Temaki',
      featured: [
        {
          name: 'Salmon temaki',
          description: 'Crisp nori, warm rice and diced salmon.',
          pieces: '1 hand roll',
          price: 10, // DEMO
          tags: ['Best seller'],
          photo: { id: '1791386809517-60f40f5372dd', alt: 'Two nori cones filled with rice and salmon on a white plate' },
        },
      ],
      more: [
        { name: 'Spicy tuna temaki', description: 'Tuna, togarashi pepper and scallions.', pieces: '1 hand roll', price: 11, tags: ['Spicy'] }, // DEMO
        { name: 'Skin temaki', description: 'Crispy salmon skin and tarê sauce.', pieces: '1 hand roll', price: 8 }, // DEMO
        { name: 'Vegetarian temaki', description: 'Cucumber, mango, avocado and sesame.', pieces: '1 hand roll', price: 7, tags: ['Vegetarian'] }, // DEMO
      ],
    },
    {
      id: 'hossomakis',
      label: 'Hossomaki',
      featured: [
        {
          name: 'Salmon hossomaki',
          description: 'The thin classic, with salmon and nori.',
          pieces: '8 pieces',
          price: 9, // DEMO
          photo: { id: '1617196034738-26c5f7c977ce', alt: 'Salmon hossomakis lined up beside a soy sauce bottle on a dark background' },
        },
        {
          name: 'Tuna hossomaki',
          description: 'Red tuna with a thread of wasabi.',
          pieces: '8 pieces',
          price: 10, // DEMO
          photo: { id: '1780291117619-c58ee7aa740e', alt: 'Plate of hossomakis with pickled ginger and chopsticks, in low light' },
        },
        {
          name: 'Kappa maki',
          description: 'Japanese cucumber and toasted sesame.',
          pieces: '8 pieces',
          price: 6, // DEMO
          tags: ['Vegetarian'],
          photo: { id: '1548907368-35e5ea8cbc8a', alt: 'Cucumber hossomakis wrapped in nori, arranged on a light plate' },
        },
      ],
      more: [
        { name: 'Kani hossomaki', description: 'Kani and Japanese mayo.', pieces: '8 pieces', price: 7 }, // DEMO
      ],
    },
    {
      id: 'uramakis',
      label: 'Uramaki',
      featured: [
        {
          name: 'Ebi tempura roll',
          description: 'Tempura shrimp, avocado and a salmon topping.',
          pieces: '8 pieces',
          price: 15, // DEMO
          tags: ['Best seller'],
          photo: { id: '1582450871972-ab5ca641643d', alt: 'Avocado-topped uramaki with tempura shrimp poking out of the ends' },
        },
        {
          name: 'Philadelphia',
          description: 'Salmon, cream cheese and scallions.',
          pieces: '8 pieces',
          price: 12, // DEMO
          photo: { id: '1558985212-92c2ff0b56e7', alt: 'Salmon and cream cheese uramakis on a dark plate with wooden chopsticks' },
        },
        {
          name: 'Flambéed salmon',
          description: 'Uramaki seared over the flame, with house sauce.',
          pieces: '8 pieces',
          price: 14, // DEMO
          tags: ['New'],
          photo: { id: '1761314025679-1bc4e2f6f7fe', alt: 'Uramakis being seared by an orange flame against a dark background' },
        },
      ],
      more: [
        { name: 'Skin roll', description: 'Crispy salmon skin and tarê.', pieces: '8 pieces', price: 11 }, // DEMO
      ],
    },
    {
      id: 'entradas',
      label: 'Starters',
      featured: [
        {
          name: 'Guioza',
          description: 'Japanese pork dumplings, pan-seared.',
          pieces: '6 pieces',
          price: 10, // DEMO
          photo: { id: '1738681336104-608b4e7dc3b0', alt: 'Golden pan-fried guiozas served on a black plate on a wooden table' },
        },
        {
          name: 'Spicy salmon joe',
          description: 'Salmon with house chili sauce over rice.',
          pieces: '4 pieces',
          price: 11, // DEMO
          tags: ['Spicy'],
          photo: { id: '1712725214706-e564b8dd1bbe', alt: 'Two pieces of joe with chopped salmon and a spicy red sauce' },
        },
        {
          name: 'Tuna tataki',
          description: 'Seared tuna, ponzu and fresh sprouts.',
          price: 13, // DEMO
          photo: { id: '1681270507609-e2a5f21969b0', alt: 'Tuna tataki with sprouts being served on a white ceramic plate' },
        },
      ],
      more: [
        { name: 'Missoshiru', description: 'Miso broth, tofu and scallions.', price: 4, tags: ['Vegetarian'] }, // DEMO
        { name: 'Edamame', description: 'Boiled pods with coarse salt.', price: 6, tags: ['Vegetarian'] }, // DEMO
        { name: 'Sunomono', description: 'Sweet-and-sour cucumber with sesame.', price: 5, tags: ['Vegetarian'] }, // DEMO
      ],
    },
    {
      id: 'bebidas',
      label: 'Drinks',
      featured: [],
      more: [
        { name: 'House sake', description: 'Junmai, served chilled.', pieces: '6 oz', price: 11 }, // DEMO
        { name: 'Premium sake', description: 'Junmai daiginjo, bottle.', pieces: '10 oz', price: 42 }, // DEMO
        { name: 'Iced green tea', description: 'Sencha brewed in house.', pieces: '14 oz', price: 4 }, // DEMO
        { name: 'Japanese beer', description: 'Imported lager.', pieces: '12 oz', price: 7 }, // DEMO
        { name: 'Sparkling water', description: 'Bottle.', pieces: '17 oz', price: 2.5 }, // DEMO
        { name: 'Soda', description: 'Can.', pieces: '12 oz', price: 2.5 }, // DEMO
      ],
    },
  ] as MenuCategory[],

  combos: [
    {
      name: 'Duo',
      pieces: 30,
      price: 39, // DEMO
      includes: ['10 niguiris', '10 uramakis', '10 hossomakis', 'Soy sauce, ginger and wasabi'], // DEMO
      photo: { id: '1607301406259-dfb186e15de8', alt: 'Sushi platter on a black plate with a soy sauce dish beside it, seen from above' },
    },
    {
      name: 'Kuro',
      pieces: 45,
      price: 56, // DEMO
      featured: true,
      includes: ['15 niguiris', '10 sashimi slices', '20 uramakis', '2 missoshirus'], // DEMO
      photo: { id: '1611143669185-af224c5e3252', alt: 'Dark table seen from above with uramakis, niguiris and sauces set out for sharing' },
    },
    {
      name: 'Feast',
      pieces: 70,
      price: 82, // DEMO
      includes: ['20 niguiris', '15 sashimi slices', '35 assorted rolls', '4 guiozas'], // DEMO
      photo: { id: '1780236935125-0e730e303beb', alt: 'Wooden sushi boat with assorted sushi, sashimi and makis' },
    },
  ],

  gallery: [
    { id: '1730900737644-e146f78db8e7', alt: 'Vegetable-filled uramaki held between chopsticks, isolated on a black background', span: 'tall' },
    { id: '1747471507235-5b5120a411cb', alt: 'Macro of a shrimp niguiri on a stone surface, in warm light', span: 'wide' },
    { id: '1675870791262-99ab4c09e2fd', alt: 'Tweezers lifting a thin slice of salmon in the dark', span: '' },
    { id: '1635452065566-9c89471bb86c', alt: 'Wooden box with tuna and salmon cuts ready for the counter', span: '' },
    { id: '1787504916858-ed4ee6f02348', alt: 'Itamae in a dark uniform behind the counter, with finished sushi in front', span: 'tall' },
    { id: '1633478062482-790e3b5dd810', alt: 'Chopsticks lifting a piece of sushi on a black plate', span: '' },
    { id: '1787589481636-a69533c81edb', alt: 'Uramakis topped with orange roe and a drizzle of sauce on a light plate', span: 'wide' },
    { id: '1761315413078-1fd73894fe0e', alt: 'Breaded avocado roll lifted by chopsticks over a dark green background', span: '' },
    { id: '1681270543584-8e541a1bb056', alt: 'Chef in uniform plating dishes on the prep counter', span: 'wide' },
    { id: '1563245370-cd55e7c95ff4', alt: 'Assorted uramakis seen from above on a dark board', span: 'wide' },
  ] as (Photo & { span: '' | 'tall' | 'wide' })[],

  reservation: {
    title: 'Book your table.', // DEMO
    text: 'Our dining room has tables for couples, families and groups. For parties of more than 12, message us on WhatsApp.', // DEMO
    note: 'Our team will confirm your reservation on WhatsApp.',
    slotMinutes: 30,
    /** Last reservation accepted X minutes before closing */
    lastSlotBeforeClose: 60,
    photo: {
      id: '1783192485640-7f3b9cec167e',
      alt: 'Wooden counter in the dining room with the chef preparing small portions in bowls',
    },
  },

  footer: {
    copyright: 'Sushi American', // DEMO
  },
};

export type Restaurant = typeof restaurant;
