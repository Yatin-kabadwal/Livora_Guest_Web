'use client';
import Link from 'next/link';
import { useMemo, type ReactNode } from 'react';
import { Logo } from '@/components/ui/Logo';
import { photos } from '@/config/photos';

export function AuthShell({ title, sub, children, footer }: { title: string; sub: string; children: ReactNode; footer?: ReactNode }) {
  const flies = useMemo(() => Array.from({ length: 22 }, (_, i) => ({ l: (i * 37) % 100, t: (i * 53) % 100, d: 6 + (i % 7), dl: (i % 9) * 0.7, s: 2 + (i % 3) })), []);
  return (
    <div className="grid min-h-[100svh] lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden overflow-hidden lg:block">
        <img src={photos.hero[1]} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full animate-kenburns object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/40 to-forest-950/60" />
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          {flies.map((f, i) => (
            <span key={i} className="absolute rounded-full bg-gold-light shadow-[0_0_12px_3px_rgba(240,217,160,.7)]" style={{ left: `${f.l}%`, top: `${f.t}%`, width: f.s, height: f.s, animation: `float ${f.d}s ease-in-out ${f.dl}s infinite alternate` }} />
          ))}
        </div>
        <div className="relative z-10 flex h-full flex-col justify-between p-14">
          <Link href="/" aria-label="Home"><Logo className="h-12" /></Link>
          <div><p className="eyebrow mb-4">Welcome</p><p className="h-display max-w-lg text-6xl">Your room in the <em className="text-gold-light">forest</em> is waiting.</p></div>
        </div>
      </div>
      <div className="relative flex items-center justify-center px-5 py-28 sm:px-10">
        <img src={photos.hero[1]} alt="" aria-hidden="true" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-15 lg:hidden" />
        <div className="w-full max-w-md">
          <Link href="/" className="mb-10 block lg:hidden" aria-label="Home"><Logo className="h-10" /></Link>
          <h1 className="h-display text-5xl sm:text-6xl">{title}</h1>
          <p className="mt-3 text-sm text-cream/60">{sub}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-center text-sm text-cream/60">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
