import type { Room } from '@/types';

export const TYPE_LABEL: Record<string, string> = { deluxe: 'Deluxe', premium: 'Premium', suite: 'Suite', family: 'Family', villa: 'Villa' };
export const TYPE_ORDER = ['deluxe', 'premium', 'suite', 'family', 'villa'];

export const TYPE_BLURB: Record<string, string> = {
  deluxe: 'Comfortable, light-filled rooms with a calm forest-side outlook.',
  premium: 'More space and a little more polish, made for slow mornings.',
  suite: 'A separate sitting area and room to spread out and unwind.',
  family: 'Generous rooms designed for families and small groups.',
  villa: 'Our most private stay, set apart for total seclusion.',
};

export const AMENITY_ICON_KEYS: Record<string, string> = {
  wifi: 'wifi', 'wi-fi': 'wifi', ac: 'snowflake', 'air conditioning': 'snowflake', tv: 'tv', geyser: 'droplets', 'hot water': 'droplets',
  balcony: 'sunrise', tea: 'coffee', coffee: 'coffee', kettle: 'coffee', minibar: 'wine', safe: 'lock', parking: 'car', 'room service': 'concierge',
  bathtub: 'bath', shower: 'bath', heater: 'flame', 'room heater': 'flame', desk: 'briefcase', wardrobe: 'shirt', hairdryer: 'wind',
};

export function groupByType(rooms: Room[]): Array<{ type: string; rooms: Room[]; from: number }> {
  const map = new Map<string, Room[]>();
  rooms.forEach((r) => map.set(r.type, [...(map.get(r.type) || []), r]));
  return Array.from(map.entries())
    .map(([type, list]) => ({ type, rooms: list, from: Math.min(...list.map((r) => r.pricePerNight)) }))
    .sort((a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type));
}

export const capacityText = (r: Room) => `Up to ${r.maxAdults} adult${r.maxAdults === 1 ? '' : 's'}${r.maxChildren ? ` + ${r.maxChildren} child${r.maxChildren === 1 ? '' : 'ren'}` : ''}`;
