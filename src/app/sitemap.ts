import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: Array<[string, number]> = [
    ['', 1], ['/rooms', 0.9], ['/booking', 0.9], ['/experiences', 0.7], ['/dining', 0.7], ['/gallery', 0.6],
    ['/about', 0.6], ['/contact', 0.7], ['/offers', 0.6], ['/privacy', 0.2], ['/terms', 0.2],
  ];
  return routes.map(([p, priority]) => ({ url: `${SITE_URL}${p}`, lastModified: now, changeFrequency: 'weekly', priority }));
}
