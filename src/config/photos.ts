/**
 * PHOTOS — the single source of truth for every image on the site.
 *
 * HOW TO REPLACE A PHOTO
 *   Drop your real photo into  public/photos/<folder>/  using the EXACT SAME FILE NAME
 *   (e.g. public/photos/rooms/deluxe-1.jpg) and redeploy. Nothing else to change.
 *
 * HOW TO ADD MORE GALLERY PHOTOS
 *   1. Put the file in  public/photos/gallery/  (e.g. gallery-13.jpg)
 *   2. Add ONE line to the `gallery` list below:
 *        { src: '/photos/gallery/gallery-13.jpg', alt: 'Describe the photo', category: 'Resort' },
 *      Categories are free text; the filter chips on /gallery are built automatically.
 *
 * ROOM PHOTOS: normally come from the API (Admin -> Rooms -> photos, stored on Cloudinary).
 * If a room has no photos, the defaults for its type below are used.
 */

export type RoomType = 'deluxe' | 'premium' | 'suite' | 'family' | 'villa';
export type GalleryPhoto = { src: string; alt: string; category: string };

const p = (path: string) => `/photos/${path}`;

export const photos = {
  ogCover: p('og-cover.jpg'),
  hero: [p('hero/hero-1.jpg'), p('hero/hero-2.jpg'), p('hero/hero-3.jpg')],
  resort: {
    about1: p('resort/about-1.jpg'),
    about2: p('resort/about-2.jpg'),
    about3: p('resort/about-3.jpg'),
    exterior: p('resort/exterior-1.jpg'),
    pool: p('resort/pool-1.jpg'),
    spa: p('resort/spa-1.jpg'),
    lawn: p('resort/lawn-1.jpg'),
    night: p('resort/night-1.jpg'),
  },
  rooms: {
    deluxe: [p('rooms/deluxe-1.jpg'), p('rooms/deluxe-2.jpg'), p('rooms/deluxe-3.jpg')],
    premium: [p('rooms/premium-1.jpg'), p('rooms/premium-2.jpg'), p('rooms/premium-3.jpg')],
    suite: [p('rooms/suite-1.jpg'), p('rooms/suite-2.jpg'), p('rooms/suite-3.jpg')],
    family: [p('rooms/family-1.jpg'), p('rooms/family-2.jpg'), p('rooms/family-3.jpg')],
    villa: [p('rooms/villa-1.jpg'), p('rooms/villa-2.jpg'), p('rooms/villa-3.jpg')],
  } as Record<RoomType, string[]>,
  dining: [p('dining/dining-1.jpg'), p('dining/dining-2.jpg'), p('dining/dining-3.jpg'), p('dining/dining-4.jpg')],
  experiences: {
    'jeep-safari': p('experiences/jeep-safari.jpg'),
    'nature-walk': p('experiences/nature-walk.jpg'),
    bonfire: p('experiences/bonfire.jpg'),
    birdwatching: p('experiences/birdwatching.jpg'),
    yoga: p('experiences/yoga.jpg'),
    'river-picnic': p('experiences/river-picnic.jpg'),
  } as Record<string, string>,
  gallery: [
    { src: p('gallery/gallery-01.jpg'), alt: 'The resort at the edge of the forest', category: 'Resort' },
    { src: p('gallery/gallery-02.jpg'), alt: 'Sal forest in morning mist', category: 'Nature' },
    { src: p('gallery/gallery-03.jpg'), alt: 'A quiet, sunlit room', category: 'Rooms' },
    { src: p('gallery/gallery-04.jpg'), alt: 'Dinner at Vedant Kitchen', category: 'Dining' },
    { src: p('gallery/gallery-05.jpg'), alt: 'Jeep safari track', category: 'Experiences' },
    { src: p('gallery/gallery-06.jpg'), alt: 'Evening bonfire', category: 'Experiences' },
    { src: p('gallery/gallery-07.jpg'), alt: 'Lawn and garden', category: 'Resort' },
    { src: p('gallery/gallery-08.jpg'), alt: 'Suite interior', category: 'Rooms' },
    { src: p('gallery/gallery-09.jpg'), alt: 'Birdwatching at dawn', category: 'Nature' },
    { src: p('gallery/gallery-10.jpg'), alt: 'Riverside picnic', category: 'Experiences' },
    { src: p('gallery/gallery-11.jpg'), alt: 'Freshly prepared food', category: 'Dining' },
    { src: p('gallery/gallery-12.jpg'), alt: 'The resort after dark', category: 'Resort' },
  ] as GalleryPhoto[],
};

/** Default photo for a room type (used when the API gives no image). */
export function fallbackRoomImage(type?: string, index = 0): string {
  const list = photos.rooms[(type as RoomType) || 'deluxe'] || photos.rooms.deluxe;
  return list[index % list.length];
}

/**
 * Turn an image reference from the API into something <img> can load.
 *  - absolute URLs (Cloudinary etc.) pass through
 *  - '/photos/...' stays local (served by this site)
 *  - missing -> fallback by room type
 */
export function resolveImage(url?: string | null, type?: string, index = 0): string {
  if (!url) return fallbackRoomImage(type, index);
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url;
  if (url.startsWith('/')) return url;
  return `/${url}`;
}

/** Resolve a room's imageUrls list, guaranteeing at least one image. */
export function resolveRoomImages(urls: string[] | undefined, type?: string): string[] {
  const list = (urls || []).filter(Boolean).map((u, i) => resolveImage(u, type, i));
  return list.length ? list : (photos.rooms[(type as RoomType)] || photos.rooms.deluxe);
}
