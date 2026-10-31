import type { APIRoute } from 'astro';
import { site as s } from '../data/site';

export const GET: APIRoute = ({ site }) => {
  const origin = (site?.href ?? '').replace(/\/$/, '');
  // While the design preview is online, keep it out of search results
  const rules = s.mockupNotice ? 'Disallow: /' : 'Allow: /';
  return new Response(`User-agent: *\n${rules}\n\nSitemap: ${origin}/sitemap.xml\n`, { headers: { 'Content-Type': 'text/plain' } });
};
