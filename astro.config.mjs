import { defineConfig } from 'astro/config';
import { site as data } from './src/data/site.ts';

// Endereço público usado no canonical, no Open Graph e no schema.org:
// domínio do cliente (site.siteUrl) ou, se vazio, o domínio de produção da Vercel.
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const site = data.siteUrl || (vercelUrl ? `https://${vercelUrl}` : 'http://localhost:4321');

// CSS embutido no HTML: uma requisição a menos antes da primeira pintura
export default defineConfig({ site, build: { inlineStylesheets: 'always' } });
