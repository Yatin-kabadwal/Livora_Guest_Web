import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RoomDetailView } from '@/components/rooms/RoomDetailView';
import { pageMeta } from '@/lib/seo';
import { API_URL } from '@/config/site';

export const dynamic = 'force-dynamic';

type Props = { params: { slug: string } };

async function fetchRoom(slug: string): Promise<{ name?: string; description?: string; imageUrls?: string[] } | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 3500);
    const res = await fetch(`${API_URL}/rooms/${encodeURIComponent(slug)}`, { signal: ctrl.signal, next: { revalidate: 300 } });
    clearTimeout(t);
    return res.ok ? await res.json() : null;
  } catch { return null; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const room = await fetchRoom(params.slug);
  const first = room?.imageUrls?.[0];
  return pageMeta(room?.name || 'Room details', room?.description?.slice(0, 160) || 'Room details, photos, amenities and live pricing at Corbett The Vedant By Livora.', `/rooms/${params.slug}`, first && /^https?:/.test(first) ? { image: first } : undefined);
}

export default function RoomPage({ params }: Props) {
  return <Suspense fallback={<div className="min-h-screen" />}><RoomDetailView slug={params.slug} /></Suspense>;
}
