import { Legal } from '@/components/pages/Legal';
import { pageMeta } from '@/lib/seo';
import { siteConfig } from '@/config/site';

export const metadata = pageMeta('Privacy Policy', 'How Corbett The Vedant By Livora collects, uses and protects your personal information.', '/privacy');

export default function Page() {
  return (
    <Legal eyebrow="Legal" title="Privacy policy" intro="We collect only what we need to look after your stay, and we do not sell your information."
      sections={[
        { h: 'What we collect', body: <><p>When you book, create an account or write to us, we collect your name, email address, phone number, stay details and any requests or messages you send. If you create an account we also store your encrypted password.</p><p>Like most websites, our servers may log technical information such as your browser type and pages visited to keep the site secure and working well.</p></> },
        { h: 'How we use it', body: <><p>We use your information to confirm and manage your booking, reply to your messages, send booking-related emails, prepare invoices and improve our service. We may contact you about your stay, but we do not send marketing without your consent.</p></> },
        { h: 'Sharing', body: <p>We share information only with the service providers who help us run the website and deliver emails, or when required by law. We do not sell personal information.</p> },
        { h: 'Cookies and storage', body: <p>This site stores a small amount of data in your browser, such as your sign-in session, your last booking reference and your message conversation links, so you can return to them easily. You can clear this any time from your browser settings.</p> },
        { h: 'Security and retention', body: <p>We take reasonable steps to protect your information. We keep booking records for as long as needed for accounting and legal obligations, and other information for as long as it is useful for your stay.</p> },
        { h: 'Your choices', body: <p>You may ask us to access, correct or delete your personal information by writing to <a className="text-gold underline" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>. Some records may need to be kept by law.</p> },
      ]} />
  );
}
