'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, User, X, Phone } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Btn } from '@/components/ui/Button';
import { useAuth } from '@/store/auth';
import { useMounted } from '@/hooks/useMedia';
import { useSettings } from '@/hooks/useSettings';
import { telLink } from '@/config/site';
import { cn } from '@/lib/format';

export const NAV = [
  { href: '/rooms', label: 'Rooms' },
  { href: '/experiences', label: 'Experiences' },
  { href: '/dining', label: 'Dining' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/offers', label: 'Offers' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const user = useAuth((s) => s.user);
  const mounted = useMounted();
  const { settings } = useSettings();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : '';
    return () => { document.documentElement.style.overflow = ''; };
  }, [open]);

  if (pathname.startsWith('/auth')) return null;
  return (
    <>
      <header className={cn('fixed inset-x-0 top-0 z-[80] transition-all duration-500', scrolled || open ? 'border-b border-white/10 bg-forest-950/75 py-3 backdrop-blur-xl' : 'py-5')}>
        <div className="container-x flex items-center justify-between gap-6">
          <Link href="/" aria-label="Corbett The Vedant By Livora, home" className="relative z-[90] shrink-0"><Logo className="h-9 sm:h-10" /></Link>
          <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
            {NAV.map((n) => {
              const active = pathname === n.href || pathname.startsWith(n.href + '/');
              return (
                <Link key={n.href} href={n.href} aria-current={active ? 'page' : undefined} className={cn('link-underline relative text-[0.8rem] font-semibold uppercase tracking-[0.16em] transition-colors hover:text-gold-light', active ? 'text-gold' : 'text-cream/80')}>
                  {n.label}
                  {active && <motion.span layoutId="nav-dot" className="absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gold" />}
                </Link>
              );
            })}
          </nav>
          <div className="relative z-[90] flex items-center gap-2 sm:gap-3">
            <a href={telLink(settings.phone)} aria-label={`Call ${settings.phone}`} className="hidden h-10 w-10 place-items-center rounded-full border border-white/15 text-cream/80 transition hover:border-gold hover:text-gold sm:grid xl:hidden"><Phone size={16} /></a>
            <Link href={mounted && user ? '/profile' : '/auth/login'} aria-label={mounted && user ? 'My profile' : 'Sign in'} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-cream/80 transition hover:border-gold hover:text-gold">
              {mounted && user ? <span className="text-sm font-bold text-gold">{user.firstName?.[0]?.toUpperCase()}</span> : <User size={17} />}
            </Link>
            <div className="hidden sm:block"><Btn href="/booking" size="sm">Book now</Btn></div>
            <button aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((o) => !o)} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-cream transition hover:border-gold lg:hidden">
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {open && (
          <motion.div id="mobile-menu" role="dialog" aria-label="Menu" data-lenis-prevent initial={{ clipPath: 'circle(0% at 92% 4%)' }} animate={{ clipPath: 'circle(150% at 92% 4%)' }} exit={{ clipPath: 'circle(0% at 92% 4%)' }} transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[75] overflow-y-auto bg-forest-950 lg:hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(47,107,79,.4),transparent_55%)]" />
            <nav aria-label="Mobile" className="relative flex min-h-full flex-col justify-center gap-1 px-8 pb-10 pt-28">
              {[{ href: '/', label: 'Home' }, ...NAV].map((n, i) => (
                <motion.div key={n.href} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
                  <Link href={n.href} className={cn('block py-1.5 font-display text-5xl transition hover:text-gold sm:text-6xl', pathname === n.href ? 'italic text-gold' : 'text-cream')}>{n.label}</Link>
                </motion.div>
              ))}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-8 flex flex-wrap gap-3">
                <Btn href="/booking" magnetic={false}>Book your stay</Btn>
                <Btn href={telLink(settings.phone)} external variant="ghost" magnetic={false}><Phone size={15} /> Call</Btn>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
