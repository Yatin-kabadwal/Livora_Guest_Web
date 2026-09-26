'use client';
import { useFetch } from './useFetch';
import type { MenuItem, Promotion, Review, Room } from '@/types';

const isArr = (d: unknown) => Array.isArray(d);

export function useRooms(params?: { type?: string; adults?: number; children?: number; checkIn?: string; checkOut?: string }) {
  const clean: Record<string, unknown> = {};
  if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '' && v !== 0) clean[k] = v; });
  return useFetch<Room[]>('/rooms', { params: clean, ttl: 30_000, isValid: isArr });
}
export const useRoom = (idOrSlug: string | null) => useFetch<Room>(idOrSlug ? `/rooms/${idOrSlug}` : null, { ttl: 30_000, isValid: (d) => !!d && typeof d === 'object' && '_id' in (d as object) });
export const useMenu = () => useFetch<MenuItem[]>('/menu', { ttl: 120_000, isValid: isArr });
export const useReviews = () => useFetch<Review[]>('/reviews', { ttl: 120_000, tries: 2, isValid: isArr });
export const usePromotions = () => useFetch<Promotion[]>('/promotions', { ttl: 120_000, tries: 2, isValid: isArr });
