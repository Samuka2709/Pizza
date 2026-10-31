import { defineConfig } from 'astro/config';
import { restaurant } from './src/data/restaurant.ts';

// Endereço público usado no canonical, no Open Graph e no schema.org:
// domínio do cliente (restaurant.siteUrl) ou, se vazio, o domínio de produção da Vercel.
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const site = restaurant.siteUrl || (vercelUrl ? `https://${vercelUrl}` : 'http://localhost:4321');

// CSS embutido no HTML: uma requisição a menos antes da primeira pintura
export default defineConfig({ site, build: { inlineStylesheets: 'always' } });
