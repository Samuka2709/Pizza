# Jiani's — home page mock-up and site prototype

Design prototype for **Jiani's**, a Neapolitan-inspired pizza caterer in London
(weddings, private parties, corporate events, schools, festivals, and a Friday pop-up in Stanmore).
Built with Astro + GSAP + Lenis. Every page is static HTML with real text.

> This is the design mock-up for the proposal. The client asked for WordPress on Hostinger,
> so the approved design is rebuilt in WordPress for launch (see "WordPress build" below).

## Pages

| Page | Path |
| --- | --- |
| Home | `/` |
| Menu (pizzas, desserts, dietary/allergen info) | `/menu/` |
| Events & Catering (event types, how it works, photos, FAQ, quote buttons) | `/events/` |
| Our Story | `/our-story/` |
| Community & Friday Pop-up (time, place, getting there, map) | `/pop-up/` |
| Contact / Book an Event (quote form) | `/contact/` |
| Privacy & cookies | `/privacy/` |

Plus `sitemap.xml`, `robots.txt` and a 404 page.

## Editing content

Everything lives in **`src/data/site.ts`**: copy, contact details, menu, prices, events, FAQ, pop-up times, photos.
Values marked `// DEMO` are sample content and must be replaced with Jiani's real details.

- **Photos**: each photo has an `id` and an `alt`. Empty `id` shows a labelled placeholder saying which photo goes there.
  An Unsplash ID works for testing; for the client's own photos adapt `src/lib/img.ts`.
- **Brand video**: set `film.src` (MP4, 16:9) and `film.poster`. The 16:9 frame is already in the home layout.
- **Quote form**: `quoteForm.endpoint` empty = demo mode (validates, blocks spam, shows the confirmation, sends nothing).
  A Formspree-style endpoint makes it send for real.
- **`mockupNotice: true`** shows the "design preview" ribbon and keeps the site out of search engines. Set to `false` for launch.

After changing the name or tagline, regenerate the share image and favicon: `npm run og`.

## Animations

- **Main animation (home hero)**: an AI-generated brand video of the sliced pizza turning on its
  board, steam rising (`public/video`, made with an image-to-video tool from a still photo).
  Two copies of the clip cross-fade at the loop point so there is no visible jump; scrolling pushes
  in slightly (`src/scripts/pizza.ts`). Phones get a smaller 854px file. To replace it, export the new
  clip with ffmpeg to `hero-1280.mp4`, `hero-1280.webm`, `hero-854.mp4` and a poster frame.
- Titles rise word by word, sections fade in, a few photos have light parallax.
- Pizza details: slice icons, crust-shaped section edges, a CSS mini Margherita on each favourite, a
  turning "Every Fri" badge, buttons that fill from the bottom like sauce, event photos that round into
  a "pizza" on hover, a big pizza on inner page heroes that rolls away on scroll.
- **Reduced motion**: with "reduce motion" on, the video does not play; its first frame stays as a still photo. If the script fails, all content shows after 4 seconds.

## WordPress build (for launch)

Recommended setup on the client's Hostinger account:

- **Theme and builder:** Astra (free) + Elementor, so text, photos and the menu are edited visually
- **Forms:** WPForms Lite (honeypot + Cloudflare Turnstile, on-screen confirmation, auto-reply)
- **Email delivery:** WP Mail SMTP connected to the business mailbox
- **SEO:** Rank Math (local SEO, LocalBusiness schema, sitemap)
- **Old Wix links:** Redirection plugin (301 redirects)
- **Speed:** LiteSpeed Cache (Hostinger), WebP images, lazy loading; keep the hero video at or below ~1.7 MB desktop / 0.7 MB mobile
- **Privacy:** Complianz (cookie notice) + privacy page; Google Maps loads on request
- **Security and backups:** Hostinger SSL and daily backups, Wordfence, limited login attempts

The scroll animations (menu deck, hero video loop) can be carried over as a small custom script loaded on
the home page only.

What this prototype does **not** do (launch tasks): real form sending, Wix content migration and redirects,
keeping the domain and business email, staging and SSL, backups and security, admin access, the how-to-update
guide and post-launch support. All content marked `// DEMO` and the Unsplash photos are placeholders.

## Commands

```
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs dist/
npm run preview  # serves dist/
npm run og       # share image + favicon
```
