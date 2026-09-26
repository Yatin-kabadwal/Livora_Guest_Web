import { Suspense } from 'react';
import { ReviewView } from '@/components/pages/ReviewView';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta('Write a review', 'Share your stay at Corbett The Vedant By Livora.', '/review', { noindex: true });
export default function Page() { return <Suspense fallback={<div className="min-h-screen" />}><ReviewView /></Suspense>; }
