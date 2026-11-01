import type { APIRoute } from 'astro';

const pages = ['/', '/cardapio/', '/eventos/', '/nossa-historia/', '/rodizio/', '/contato/', '/privacidade/'];

export const GET: APIRoute = ({ site }) => {
  const origin = (site?.href ?? '').replace(/\/$/, '');
  const urls = pages.map((p) => `  <url><loc>${origin}${p}</loc></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
