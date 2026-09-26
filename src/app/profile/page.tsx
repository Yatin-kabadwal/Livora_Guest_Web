import { ProfileView } from '@/components/pages/ProfileView';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta('My account', 'Your bookings, messages and details at Corbett The Vedant By Livora.', '/profile', { noindex: true });
export default function Page() { return <ProfileView />; }
