import { Suspense } from 'react';
import { BookingWizard } from '@/components/booking/BookingWizard';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta('Book your stay', 'Book a room at Corbett The Vedant By Livora in four easy steps. No payment now, pay at the resort at check-in.', '/booking');

export default function BookingPage() {
  return <Suspense fallback={<div className="min-h-screen" />}><BookingWizard /></Suspense>;
}
