/**
 * SITE CONFIG — the owner-editable basics.
 * These are FALLBACK values. When the API is reachable, the live values from
 * GET /settings/public (edited in the Admin panel -> Settings) are merged over these.
 * Leave a social link as '' to hide it.
 */
export const siteConfig = {
  name: 'Corbett The Vedant By Livora',
  shortName: 'The Vedant',
  brand: 'By Livora',
  tagline: 'A forest sanctuary at the edge of Jim Corbett',
  description:
    'Ten private rooms at the edge of Jim Corbett National Park, Uttarakhand. Sal forest, Kosi river air, jeep safaris and unhurried mornings, hosted by Livora.',
  phone: '+91 95288 27446',
  whatsapp: '919528827446', // digits only, with country code
  email: 'Livorahospitality06@gmail.com',
  address: 'Corbett The Vedant By Livora, Jim Corbett, Uttarakhand, India',
  mapsUrl: 'https://maps.app.goo.gl/cEp1Z3fmkQMXzEau8',
  mapsEmbedUrl: 'https://www.google.com/maps?q=Corbett+The+Vedant+By+Livora&output=embed',
  checkInTime: '14:00',
  checkOutTime: '11:00',
  cancellationHours: 48,
  social: { instagram: '', facebook: '', youtube: '' },
  totalRooms: 10,
} as const;

export type SiteConfig = {
  name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  mapsUrl: string;
  mapsEmbedUrl: string;
  checkInTime: string;
  checkOutTime: string;
  cancellationHours: number;
  social: { instagram: string; facebook: string; youtube: string };
};

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export const waLink = (whatsapp: string, text?: string) =>
  `https://wa.me/${whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
export const telLink = (phone: string) => `tel:${phone.replace(/[^+\d]/g, '')}`;
