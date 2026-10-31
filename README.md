# Sushi American — site

Single-page site (Astro + GSAP + Lenis). All HTML is static, with the menu as real text.
The site is in English and prices are in US dollars.

## Switching clients

Edit only `src/data/restaurant.ts`. Values marked `// DEMO` are placeholder data:
name, WhatsApp, address, hours, dishes, prices, copy and photos.

- `google: null` hides the reviews section. Only fill it with real data.
- Currency and number formatting live in `src/lib/format.ts` (and `money` in `src/scripts/bag.ts`).
- Photos: currently free Unsplash photo IDs. To use your own photos, change `src/lib/img.ts`.

After changing the name, tagline or hero photo, regenerate the share image and favicon:

```
npm run og
```

## Commands

```
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs dist/
npm run preview  # serves dist/
```
