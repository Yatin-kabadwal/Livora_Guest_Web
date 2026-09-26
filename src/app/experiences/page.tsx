import { PageHero } from '@/components/ui/Section';
import { ExperiencesView } from '@/components/pages/ExperiencesView';
import { pageMeta } from '@/lib/seo';
import { photos } from '@/config/photos';

export const metadata = pageMeta('Experiences', 'Jeep safari, guided nature walks, birdwatching, riverside picnics, bonfire evenings and yoga at Corbett The Vedant By Livora.', '/experiences');
export default function Page() {
  return (<><PageHero eyebrow="Experiences" title="Days shaped by the forest" italicWords={['forest']} sub="Everything here is unhurried and arranged on request. Tell us what draws you and we will help plan it." image={photos.experiences['jeep-safari']} /><ExperiencesView /></>);
}
