import { Suspense } from 'react';
import { ConfirmationView } from '@/components/booking/ConfirmationView';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta('Booking confirmed', 'Your booking at Corbett The Vedant By Livora.', '/booking/confirmation', { noindex: true });
export default function Page() { return <Suspense fallback={<div className="min-h-screen" />}><ConfirmationView /></Suspense>; }
