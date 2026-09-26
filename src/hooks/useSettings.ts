'use client';
import { useMemo } from 'react';
import { useFetch } from './useFetch';
import { siteConfig } from '@/config/site';
import type { PublicSettings } from '@/types';

export const defaultMealPlans = [
  { code: 'ep', label: 'Room only', adultPrice: 0, childPrice: 0, description: 'No meals included' },
  { code: 'cp', label: 'Room with breakfast', adultPrice: 0, childPrice: 0, description: 'Breakfast included' },
];

/** Merged settings: live API values over site.ts defaults. Never null. */
export function useSettings() {
  const { data, loading, error } = useFetch<PublicSettings>('/settings/public', { ttl: 5 * 60_000, tries: 2 });
  const settings = useMemo(() => {
    const d = data || ({} as Partial<PublicSettings>);
    const pick = <T,>(v: T | undefined | null | '', f: T): T => (v === undefined || v === null || v === '' ? f : (v as T));
    return {
      resortName: pick(d.resortName, siteConfig.name),
      tagline: pick(d.tagline, siteConfig.tagline),
      phone: pick(d.phone, siteConfig.phone),
phoneSecondary: pick(d.phoneSecondary, siteConfig.phoneSecondary),
whatsapp: pick(d.whatsapp, siteConfig.whatsapp).replace(/\D/g, ''),
      email: pick(d.email, siteConfig.email),
      address: pick(d.address, siteConfig.address),
      mapsUrl: pick(d.mapsUrl, siteConfig.mapsUrl),
      mapsEmbedUrl: pick(d.mapsEmbedUrl, siteConfig.mapsEmbedUrl),
      checkInTime: pick(d.checkInTime, siteConfig.checkInTime),
      checkOutTime: pick(d.checkOutTime, siteConfig.checkOutTime),
      cancellationHours: pick(d.cancellationHours, siteConfig.cancellationHours),
      mealPlans: d.mealPlans && d.mealPlans.length ? d.mealPlans : defaultMealPlans,
      social: { ...siteConfig.social, ...(d.social || {}) },
      bookingsOpen: d.bookingsOpen !== false,
      announcement: d.announcement || '',
    };
  }, [data]);
  return { settings, loading, error, live: !!data };
}
export type ResolvedSettings = ReturnType<typeof useSettings>['settings'];
