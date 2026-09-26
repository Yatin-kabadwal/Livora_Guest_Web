import type { ReactNode } from 'react';
import { MaskText, Reveal } from './Motion';
import { cn } from '@/lib/format';

export function SectionHeading({ eyebrow, title, sub, align = 'left', className, italicWords }: { eyebrow?: string; title: string; sub?: ReactNode; align?: 'left' | 'center'; className?: string; italicWords?: string[] }) {
  return (
    <div className={cn(align === 'center' && 'mx-auto text-center', 'max-w-3xl', className)}>
      {eyebrow && <Reveal><p className="eyebrow mb-4">{eyebrow}</p></Reveal>}
      <h2 className="h-display text-5xl text-cream sm:text-6xl lg:text-7xl"><MaskText text={title} italicWords={italicWords} /></h2>
      {sub && <Reveal delay={0.15}><p className="mt-6 text-base leading-relaxed text-cream/70 sm:text-lg">{sub}</p></Reveal>}
    </div>
  );
}

/** Compact hero for inner pages. */
export function PageHero({ eyebrow, title, sub, image, italicWords }: { eyebrow: string; title: string; sub?: string; image?: string; italicWords?: string[] }) {
  return (
    <header className="relative isolate overflow-hidden pt-36 pb-16 sm:pt-44 sm:pb-24">
      {image && (
        <>
          <img src={image} alt="" className="absolute inset-0 -z-20 h-full w-full animate-kenburns object-cover opacity-40" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-forest-950/70 via-forest-950/60 to-forest-950" />
        </>
      )}
      {!image && <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(47,107,79,.35),transparent_60%)]" />}
      <div className="container-x">
        <p className="eyebrow mb-5">{eyebrow}</p>
        <h1 className="h-display max-w-5xl text-6xl text-cream sm:text-7xl lg:text-[7.5rem]"><MaskText text={title} italicWords={italicWords} instant /></h1>
        {sub && <p className="mt-7 max-w-2xl text-base leading-relaxed text-cream/70 sm:text-lg">{sub}</p>}
      </div>
    </header>
  );
}
