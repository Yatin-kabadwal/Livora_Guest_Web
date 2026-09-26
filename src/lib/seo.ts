import type { Metadata } from 'next';
import { SITE_URL, siteConfig } from '@/config/site';
import { photos } from '@/config/photos';

export function pageMeta(title: string, description: string, path: string, opts?: { noindex?: boolean; image?: string }): Metadata {
  const img = opts?.image || photos.ogCover;
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: opts?.noindex ? { index: false, follow: false } : undefined,
    openGraph: { title: `${title} | ${siteConfig.name}`, description, url: `${SITE_URL}${path}`, images: [{ url: img, width: 1200, height: 630, alt: siteConfig.name }] },
    twitter: { card: 'summary_large_image', title: `${title} | ${siteConfig.name}`, description, images: [img] },
  };
}
