import type { ReactNode } from 'react';
import { PageHero } from '@/components/ui/Section';

export function Legal({ eyebrow, title, intro, sections }: { eyebrow: string; title: string; intro: string; sections: Array<{ h: string; body: ReactNode }> }) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} sub={intro} />
      <div className="container-x pb-16">
        <div className="mx-auto max-w-3xl space-y-10">
          {sections.map((s, i) => (
            <section key={s.h} aria-labelledby={`l-${i}`} className="border-t border-white/10 pt-8">
              <h2 id={`l-${i}`} className="font-display text-3xl text-cream">{s.h}</h2>
              <div className="mt-3 space-y-3 leading-relaxed text-cream/70">{s.body}</div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
