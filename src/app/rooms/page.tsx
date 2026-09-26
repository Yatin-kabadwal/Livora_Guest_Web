import { Suspense } from 'react';
import { PageHero } from '@/components/ui/Section';
import { RoomsView } from '@/components/rooms/RoomsView';
import { pageMeta } from '@/lib/seo';
import { photos } from '@/config/photos';

export const metadata = pageMeta('Rooms & Suites', 'Ten private rooms across five categories at the edge of Jim Corbett National Park. Check live availability and book online, pay at the resort.', '/rooms');

export default function RoomsPage() {
  return (
    <>
      <PageHero eyebrow="Stay" title="Rooms & suites" italicWords={['suites']} sub="Ten rooms, five categories, all with the forest just outside. Choose your dates to see what is available." image={photos.rooms.suite[0]} />
      <Suspense fallback={<div className="container-x py-20" />}><RoomsView /></Suspense>
    </>
  );
}
