import { PageHero } from '@/components/ui/Section';
import { GalleryView } from '@/components/pages/GalleryView';
import { pageMeta } from '@/lib/seo';
import { photos } from '@/config/photos';

export const metadata = pageMeta('Gallery', 'A look at Corbett The Vedant By Livora: rooms, dining, the forest and the experiences around it.', '/gallery');
export default function Page() {
  return (<><PageHero eyebrow="Gallery" title="A glimpse of the forest" italicWords={['forest']} image={photos.gallery[1].src} /><GalleryView /></>);
}
