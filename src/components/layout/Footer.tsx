'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Instagram, Facebook, Youtube, Mail, MapPin, Phone } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useSettings } from '@/hooks/useSettings';
import { telLink } from '@/config/site';
import { formatClock } from '@/lib/format';

export function Footer() {
  const pathname = usePathname();
  const { settings: s } = useSettings();
  const socials = [
    { k: 'instagram', href: s.social.instagram, Icon: Instagram },
    { k: 'facebook', href: s.social.facebook, Icon: Facebook },
    { k: 'youtube', href: s.social.youtube, Icon: Youtube },
  ].filter((x) => x.href);
  if (pathname.startsWith('/auth')) return null;
  const col = 'space-y-3 text-sm text-cream/65';
  const lnk = 'link-underline transition hover:text-gold-light';
  return (
    <footer className="relative mt-24 border-t border-white/10 bg-forest-950 pb-28 pt-16 md:pb-10">
      <div className="container-x">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          <div>
            <Logo className="h-11" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/60">Ten private rooms at the edge of Jim Corbett National Park. A quiet forest sanctuary, hosted by Livora.</p>
            {socials.length > 0 && (
              <div className="mt-5 flex gap-3">
                {socials.map(({ k, href, Icon }) => <a key={k} href={href} target="_blank" rel="noopener noreferrer" aria-label={k} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-cream/75 transition hover:border-gold hover:text-gold"><Icon size={16} /></a>)}
              </div>
            )}
          </div>
          <nav aria-label="Explore"><h2 className="eyebrow mb-4">Explore</h2>
            <ul className={col}>
              {[['/rooms', 'Rooms & suites'], ['/experiences', 'Experiences'], ['/dining', 'Vedant Kitchen'], ['/gallery', 'Gallery'], ['/offers', 'Offers'], ['/about', 'Our story']].map(([h, l]) => <li key={h}><Link className={lnk} href={h}>{l}</Link></li>)}
            </ul>
          </nav>
          <nav aria-label="Guest services"><h2 className="eyebrow mb-4">Guests</h2>
            <ul className={col}>
              {[['/booking', 'Book a stay'], ['/booking/manage', 'Manage booking'], ['/contact', 'Contact & FAQs'], ['/profile', 'My account'], ['/privacy', 'Privacy policy'], ['/terms', 'Terms & cancellation']].map(([h, l]) => <li key={h}><Link className={lnk} href={h}>{l}</Link></li>)}
            </ul>
          </nav>
          <address className="not-italic"><h2 className="eyebrow mb-4">Find us</h2>
            <ul className={col}>
              <li className="flex gap-3"><MapPin size={16} className="mt-0.5 shrink-0 text-gold" /><a href={s.mapsUrl} target="_blank" rel="noopener noreferrer" className={lnk}>{s.address}</a></li>
              <li className="flex gap-3"><Phone size={16} className="mt-0.5 shrink-0 text-gold" /><a href={telLink(s.phone)} className={lnk}>{s.phone}</a></li>
              <li className="flex gap-3"><Mail size={16} className="mt-0.5 shrink-0 text-gold" /><a href={`mailto:${s.email}`} className={`${lnk} break-all`}>{s.email}</a></li>
              <li className="text-cream/50">Check-in {formatClock(s.checkInTime)} · Check-out {formatClock(s.checkOutTime)}<br />Front desk open 24x7</li>
            </ul>
          </address>
        </div>
        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-cream/45 sm:flex-row">
          <p>© {new Date().getFullYear()} {s.resortName}. All rights reserved.</p>
          <p>Pay at property · No online payment required</p>
        </div>
      </div>
    </footer>
  );
}
