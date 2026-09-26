import { PageHero } from '@/components/ui/Section';
import { OffersView } from '@/components/pages/OffersView';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta('Offers', 'Current offers and promo codes for Corbett The Vedant By Livora.', '/offers');
export default function Page() {
  return (<><PageHero eyebrow="Offers" title="Current offers" italicWords={['offers']} sub="Copy a code, then apply it when you book." /><OffersView /></>);
}
