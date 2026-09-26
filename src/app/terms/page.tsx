import { Legal } from '@/components/pages/Legal';
import { pageMeta } from '@/lib/seo';
import { siteConfig } from '@/config/site';

export const metadata = pageMeta('Terms & Cancellation', 'Booking, cancellation and stay terms for Corbett The Vedant By Livora.', '/terms');

export default function Page() {
  return (
    <Legal eyebrow="Legal" title="Terms & cancellation" intro="Simple terms for a simple stay. If anything is unclear, please ask us before you book."
      sections={[
        { h: 'Bookings', body: <p>A booking made on this website is confirmed once you receive a booking reference and confirmation email. Rooms are subject to availability at the time of booking. Room rates are in Indian Rupees and include applicable GST.</p> },
        { h: 'Pay at property', body: <p>No online payment is taken when you book. The total for your stay, along with any extras or meals consumed, is settled at the resort at check-in or check-out, as arranged with our front desk.</p> },
        { h: 'Cancellation', body: <><p>You can cancel free of charge up to the number of hours before check-in shown on the booking page and in your confirmation. You can cancel from the Manage booking page using your reference and email.</p><p>For cancellations after that time, or in case of a no-show, please contact us; the resort may apply its standard policy.</p></> },
        { h: 'Check-in and check-out', body: <p>Standard check-in and check-out times are shown on the booking page. Early check-in and late check-out are subject to availability. Guests may be asked for a valid photo ID at check-in, as required by law.</p> },
        { h: 'Guest conduct and the forest', body: <p>We share our home with wildlife. Please follow the guidance of our team and park authorities, keep noise low after dark and never feed or approach animals. Safaris and outdoor activities are subject to park rules, weather and safety conditions, and sightings are never guaranteed.</p> },
        { h: 'Changes to these terms', body: <p>We may update these terms from time to time. The terms shown at the time of your booking apply to your stay. Questions? Write to <a className="text-gold underline" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.</p> },
      ]} />
  );
}
