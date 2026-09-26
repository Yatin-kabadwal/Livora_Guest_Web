import { PageHero } from '@/components/ui/Section';
import { DiningView } from '@/components/pages/DiningView';
import { pageMeta } from '@/lib/seo';
import { photos } from '@/config/photos';

export const metadata = pageMeta('Vedant Kitchen', 'Fresh, honest food at Vedant Kitchen, with vegetarian and non-vegetarian dishes. See the live menu.', '/dining');
export default function Page() {
  return (<><PageHero eyebrow="Dining" title="Vedant Kitchen" italicWords={['Kitchen']} sub="Warm plates for the appetite you build in the forest. Here is today's menu, straight from the kitchen." image={photos.dining[2]} /><DiningView /></>);
}
