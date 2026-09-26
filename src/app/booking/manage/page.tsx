import { Suspense } from 'react';
import { ManageView } from '@/components/booking/ManageView';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta('Manage your booking', 'Look up, review or cancel your booking at Corbett The Vedant By Livora.', '/booking/manage', { noindex: true });
export default function Page() { return <Suspense fallback={<div className="min-h-screen" />}><ManageView /></Suspense>; }
