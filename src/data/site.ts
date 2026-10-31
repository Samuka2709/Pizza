/**
 * Single content file for the whole site.
 * Copy, contact details, menu, events, FAQ and photos all come from here,
 * so the client (or whoever maintains the site) only edits this file.
 *
 * Values marked // DEMO are sample content for the design mock-up.
 * Replace them with Jiani's real details before anything goes live.
 *
 * Photos: leave `id` empty to show a labelled placeholder (the caption says
 * which photo goes there). To use a free Unsplash photo, paste its ID
 * (the part after "photo-"). For the client's own photos, adapt `src/lib/img.ts`.
 */

export interface Photo {
  /** Unsplash photo ID. Empty = labelled placeholder */
  id: string;
  /** Descriptive alt text (also used as the placeholder caption) */
  alt: string;
}

/** UK dietary markers shown on the menu */
export type Diet = 'V' | 'VG' | 'GF' | 'N';

export interface MenuItem {
  name: string;
  description: string;
  price: number;
  diet?: Diet[];
  /** Allergens from the UK list of 14 */
  allergens?: string[];
  signature?: boolean;
}

export interface MenuGroup {
  id: string;
  label: string;
  note?: string;
  items: MenuItem[];
}

export const site = {
  name: "Jiani's",
  tagline: 'Neapolitan-inspired pizza, fired wherever you gather.', // DEMO
  city: 'London',
  /** Production domain. Empty = Vercel production URL (mock-up) */
  siteUrl: '', // DEMO (e.g. 'https://www.jianis.co.uk')
  timezone: 'Europe/London',
  priceRange: '££',

  /** Small ribbon that tells visitors this is a design preview. Set to false for launch. */
  mockupNotice: true,

  seo: {
    title: "Jiani's — Neapolitan pizza catering for events in London", // DEMO
    description:
      "Wood-fired Neapolitan-style pizza for weddings, private parties, corporate events, schools and festivals across London. Find us at our Friday pop-up in Stanmore.", // DEMO
  },

  contact: {
    phone: '+44 20 0000 0000', // DEMO
    phoneHref: '+442000000000', // DEMO
    email: 'hello@example.com', // DEMO
    /** Social links. Empty string hides the link. */
    social: {
      instagram: 'https://www.instagram.com/', // DEMO (full profile URL)
      facebook: 'https://www.facebook.com/', // DEMO
      tiktok: '', // DEMO
    },
    serviceArea: 'London and the Home Counties', // DEMO
  },

  /**
   * Quote form. With `endpoint` empty the form runs in demo mode: it validates,
   * blocks spam and shows the confirmation, but sends nothing.
   * A Formspree-style endpoint (POST, JSON reply) makes it send for real.
   * On the WordPress build this becomes WPForms/Fluent Forms + an SMTP plugin.
   */
  quoteForm: {
    endpoint: '',
    successTitle: 'Thank you, we have your enquiry.',
    successText:
      "We'll reply within one working day with availability and a tailored quote. A copy of your details is on its way to your inbox.", // DEMO
  },

  nav: [
    { label: 'Menu', href: '/menu/' },
    { label: 'Events & Catering', href: '/events/' },
    { label: 'Our Story', href: '/our-story/' },
    { label: 'Friday Pop-up', href: '/pop-up/' },
    { label: 'Contact', href: '/contact/' },
  ],

  /* ------------------------------------------------------------------------
     Home
     ------------------------------------------------------------------------ */
  hero: {
    eyebrow: 'Neapolitan-inspired pizza · London', // DEMO
    /** Captions that follow the pizza being built as you scroll */
    steps: [
      'Dough, rested slowly', // DEMO
      'Tomato, spooned from the centre',
      'Fior di latte, torn by hand',
      'Basil and a thread of olive oil',
      'Into the fire, about ninety seconds',
      'Sliced and served, hot',
    ],
  },

  marquee: ['Weddings', 'Private parties', 'Corporate events', 'Schools', 'Festivals', 'Fridays in Stanmore'],

  /**
   * Brand film slot on the home page. The frame is already in the layout:
   * add the video file (MP4, 16:9) and a poster photo and it plays here.
   */
  film: {
    src: '', // e.g. '/video/jianis-brand-film.mp4'
    poster: { id: '', alt: 'Brand film poster: the oven at full flame during an evening event' } as Photo,
    title: 'Pizza that turns up and turns it on.', // DEMO
    text: 'A short film about the oven, the dough and the people around it. Coming soon.', // DEMO
  },

  intro: {
    label: 'What we do',
    title: 'We bring the oven, the dough and the theatre to your event.', // DEMO
    text: 'Pizza made in front of your guests, the way it is made in Naples: soft, blistered and ready in minutes. From a garden party for thirty to a festival field, the founder is at the oven.', // DEMO
  },

  /* ------------------------------------------------------------------------
     Events & Catering
     ------------------------------------------------------------------------ */
  events: {
    title: 'Pizza for the days people remember.', // DEMO
    lead: 'Tell us the date, the place and roughly how many guests. We will come back with a menu and a fixed quote.', // DEMO
    types: [
      {
        id: 'weddings',
        name: 'Weddings',
        text: 'Evening food that gets everyone back on their feet. Served from the oven or passed around as the party goes on.', // DEMO
        photo: { id: '', alt: 'Wedding guests gathered around the pizza oven at dusk' },
      },
      {
        id: 'private-parties',
        name: 'Private parties',
        text: 'Birthdays, anniversaries and garden gatherings. We set up, cook to order and leave the garden as we found it.', // DEMO
        photo: { id: '', alt: 'Pizzas on a long garden table during a private party' },
      },
      {
        id: 'corporate',
        name: 'Corporate events',
        text: 'Team days, launches and office parties, with clear invoicing and timings that fit your agenda.', // DEMO
        photo: { id: '', alt: 'Colleagues collecting slices at an office event' },
      },
      {
        id: 'schools',
        name: 'Schools',
        text: 'Summer fairs, leavers’ days and staff events. Simple menus that children love and parents trust.', // DEMO
        photo: { id: '', alt: 'Pizza being served at a school summer fair' },
      },
      {
        id: 'festivals',
        name: 'Festivals',
        text: 'High-volume service with a compact footprint. We can trade or be booked as a paid-for food option.', // DEMO
        photo: { id: '', alt: 'Pizza stall at an outdoor festival with a queue forming' },
      },
    ] as { id: string; name: string; text: string; photo: Photo }[],
    steps: [
      { title: 'Tell us about it', text: 'Send the quote form with your date, location and number of guests.' }, // DEMO
      { title: 'Your menu and quote', text: 'We suggest a menu for your crowd and send a fixed price, with no hidden extras.' }, // DEMO
      { title: 'We fire up', text: 'We arrive early, set up the oven and cook to order for the agreed service time.' }, // DEMO
      { title: 'We leave it clean', text: 'We pack down and take everything with us. You just enjoy the evening.' }, // DEMO
    ],
    faq: [
      {
        q: 'How many guests can you cater for?', // DEMO
        a: 'From around 30 to several hundred guests. For larger events we bring a second oven and extra hands.', // DEMO
      },
      {
        q: 'How much space and power do you need?', // DEMO
        a: 'A flat area of roughly 3 by 3 metres, outdoors or in a well-ventilated space. The oven runs without mains power.', // DEMO
      },
      {
        q: 'Can you cater for vegetarian, vegan and gluten-free guests?', // DEMO
        a: 'Yes. Every menu includes vegetarian and vegan pizzas, and gluten-free bases can be arranged in advance. Tell us about allergies when you book.', // DEMO
      },
      {
        q: 'How far do you travel?', // DEMO
        a: 'Across London and the Home Counties. Travel further afield is quoted case by case.', // DEMO
      },
      {
        q: 'How far ahead should we book?', // DEMO
        a: 'Summer Saturdays go first, so for weddings we suggest booking several months ahead. For smaller events, a few weeks is often enough.', // DEMO
      },
      {
        q: 'How do deposits and payment work?', // DEMO
        a: 'A deposit secures your date and the balance is due shortly before the event. Full terms come with your quote.', // DEMO
      },
    ],
  },

  /* ------------------------------------------------------------------------
     Friday pop-up
     ------------------------------------------------------------------------ */
  popup: {
    title: 'Every Friday in Stanmore.',
    lead: 'Our weekly pop-up is where you can try the menu without booking an event. Come early, the dough runs out.', // DEMO
    /** 5 = Friday. Times in Europe/London */
    weekday: 5,
    open: '17:00', // DEMO
    close: '21:00', // DEMO
    place: 'Stanmore, London', // DEMO (exact pitch to confirm)
    addressLines: ['Exact pitch to be confirmed', 'Stanmore, London HA7'], // DEMO
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Stanmore%2C+London', // DEMO
    mapsEmbed: 'https://www.google.com/maps?q=Stanmore,+London&output=embed', // DEMO
    gettingThere: [
      { title: 'By Tube', text: 'Stanmore station, at the end of the Jubilee line, is a short walk away.' }, // DEMO (confirm walking time)
      { title: 'By bus', text: 'Several local routes stop nearby. Check TfL Journey Planner for the best one from you.' }, // DEMO
      { title: 'By car', text: 'Street and pay-and-display parking nearby. Please check local restrictions.' }, // DEMO
    ],
    notes: ['Card and contactless accepted', 'Vegetarian and vegan options every week', 'Follow us for weekly specials'], // DEMO
    photo: { id: '', alt: 'The Friday pop-up in Stanmore at dusk, with the oven glowing' } as Photo,
  },

  /* ------------------------------------------------------------------------
     Our story
     ------------------------------------------------------------------------ */
  story: {
    title: 'A Naples habit, brought home to London.', // DEMO
    lead: "Jiani's is run by its founder, who is at the oven for almost every event and every Friday.", // DEMO
    paragraphs: [
      "The idea came from Naples, where pizza is eaten quickly, folded, standing up, with friends. It is everyday food made with care, and that is what we wanted to share.", // DEMO
      'We keep the menu short and the dough slow. Simple toppings, good flour and a very hot oven do most of the work; the rest is practice, many thousands of pizzas of it.', // DEMO
      'Today we cook at weddings, parties, schools and festivals, and every Friday at our pop-up in Stanmore. Same oven, same dough, same founder.', // DEMO
    ],
    quote: 'Good pizza is simple. Making it simple takes years.', // DEMO
    quoteBy: 'The founder', // DEMO (founder name)
    values: [
      { title: 'Slow dough', text: 'Rested for a long time so it bakes light and is easy to digest.' }, // DEMO
      { title: 'Few ingredients', text: 'A short list of toppings, chosen because they taste right together.' }, // DEMO
      { title: 'Cooked in front of you', text: 'The oven is part of the event. Guests watch every pizza go in and come out.' }, // DEMO
    ],
    photos: [
      { id: '', alt: 'The founder stretching dough by hand on a floured board' },
      { id: '', alt: 'Close-up of a blistered crust coming out of the oven' },
    ] as Photo[],
  },

  /* ------------------------------------------------------------------------
     Menu (prices in GBP)
     ------------------------------------------------------------------------ */
  menuNote:
    'Our menu changes with the seasons and the event. Allergen information is a guide only; please tell us about any allergy before ordering.', // DEMO
  menu: [
    {
      id: 'pizzas',
      label: 'Pizzas',
      note: 'Around 11 inches, made to order. Gluten-free bases available on request at events.', // DEMO
      items: [
        { name: 'Marinara', description: 'Tomato, garlic, oregano, extra virgin olive oil.', price: 8, diet: ['VG'], allergens: ['Gluten'] }, // DEMO
        { name: 'Margherita', description: 'Tomato, fior di latte, basil, olive oil.', price: 10, diet: ['V'], allergens: ['Gluten', 'Milk'], signature: true }, // DEMO
        { name: 'Diavola', description: 'Tomato, fior di latte, spicy salami, chilli oil.', price: 12, allergens: ['Gluten', 'Milk'] }, // DEMO
        { name: 'Funghi e salsiccia', description: 'Fior di latte, roasted mushrooms, fennel sausage, parmesan.', price: 13, allergens: ['Gluten', 'Milk'] }, // DEMO
        { name: 'Nduja e miele', description: 'Tomato, fior di latte, spicy nduja, a drizzle of hot honey.', price: 13, allergens: ['Gluten', 'Milk'], signature: true }, // DEMO
        { name: 'Quattro formaggi', description: 'Fior di latte, gorgonzola, parmesan, smoked provola, black pepper.', price: 12, diet: ['V'], allergens: ['Gluten', 'Milk'] }, // DEMO
        { name: 'Verdure', description: 'Tomato, vegan mozzarella, grilled courgette, peppers, olives.', price: 11, diet: ['VG'], allergens: ['Gluten'] }, // DEMO
        { name: 'Pesto e burrata', description: 'Basil pesto, burrata added after the oven, cherry tomatoes.', price: 14, diet: ['V'], allergens: ['Gluten', 'Milk', 'Nuts'] }, // DEMO
      ],
    },
    {
      id: 'desserts',
      label: 'Desserts',
      items: [
        { name: 'Nutella calzoncini', description: 'Little folded doughs filled with Nutella, dusted with sugar.', price: 6, diet: ['V'], allergens: ['Gluten', 'Milk', 'Nuts', 'Soya'] }, // DEMO
        { name: 'Tiramisù', description: 'Coffee-soaked savoiardi, mascarpone cream, cocoa.', price: 6, diet: ['V'], allergens: ['Gluten', 'Milk', 'Eggs'] }, // DEMO
        { name: 'Lemon sorbet', description: 'Amalfi-style lemon sorbet.', price: 5, diet: ['VG', 'GF'] }, // DEMO
      ],
    },
    {
      id: 'sides',
      label: 'Sides & drinks',
      items: [
        { name: 'Dough balls', description: 'Garlic and herb butter.', price: 5, diet: ['V'], allergens: ['Gluten', 'Milk'] }, // DEMO
        { name: 'Rocket and parmesan salad', description: 'Lemon and olive oil dressing.', price: 5, diet: ['V', 'GF'], allergens: ['Milk'] }, // DEMO
        { name: 'Italian soft drinks', description: 'Lemon, blood orange.', price: 3, diet: ['VG', 'GF'] }, // DEMO
      ],
    },
  ] as MenuGroup[],

  dietKey: [
    { code: 'V', label: 'Vegetarian' },
    { code: 'VG', label: 'Vegan' },
    { code: 'GF', label: 'Gluten-free' },
    { code: 'N', label: 'Contains nuts' },
  ] as { code: Diet; label: string }[],

  /* ------------------------------------------------------------------------
     Gallery and shared photos
     ------------------------------------------------------------------------ */
  gallery: [
    { id: '', alt: 'Margherita straight from the oven, leopard-spotted crust', span: 'tall' },
    { id: '', alt: 'Hands stretching a dough ball on a floured board', span: '' },
    { id: '', alt: 'Guests queuing at the oven during an evening wedding', span: 'wide' },
    { id: '', alt: 'Basil leaves on a just-baked pizza, close-up', span: '' },
    { id: '', alt: 'The oven flame at full heat, seen from the opening', span: '' },
    { id: '', alt: 'A slice being lifted with a stretch of mozzarella', span: '' },
  ] as (Photo & { span: '' | 'tall' | 'wide' })[],

  footer: {
    copyright: "Jiani's", // DEMO (legal name)
  },
};

export type Site = typeof site;
