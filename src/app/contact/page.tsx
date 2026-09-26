import { PageHero } from '@/components/ui/Section';
import { ContactView } from '@/components/pages/ContactView';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta('Contact Us', 'Message, call or WhatsApp Corbett The Vedant By Livora. Find directions, opening hours and answers to common questions.', '/contact');
export default function Page() {
  return (<><PageHero eyebrow="Contact" title="We'd love to hear from you" italicWords={['hear']} sub="Questions about rooms, safaris, events or anything else? Write to us and a real person will reply." /><ContactView /></>);
}
