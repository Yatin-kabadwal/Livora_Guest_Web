'use client';
import { useEffect } from 'react';
import { MessageCircle, Check } from 'lucide-react';
import { Reveal, ParallaxImage, MaskText } from '@/components/ui/Motion';
import { experiences } from '@/config/experiences';
import { cn } from '@/lib/format';

export function ExperiencesView() {
  useEffect(() => {
    if (window.location.hash) setTimeout(() => document.querySelector(window.location.hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 700);
  }, []);
  const enquire = (title: string) => {
    window.dispatchEvent(new CustomEvent('cvl-open-chat', { detail: { topic: 'booking', subject: `Enquiry: ${title}`, message: `Hello, I would like to know more about the ${title} experience at your resort.` } }));
  };
  return (
    <div className="container-x space-y-28 pb-16 sm:space-y-40">
      {experiences.map((e, i) => (
        <section key={e.slug} id={e.slug} aria-labelledby={`${e.slug}-h`} className="grid scroll-mt-32 items-center gap-10 lg:grid-cols-2 lg:gap-20">
          <div className={cn(i % 2 === 1 && 'lg:order-2')}><ParallaxImage src={e.image} alt={e.title} className="aspect-[4/5] rounded-[2.5rem]" amount={10} /></div>
          <div>
            <Reveal><p className="eyebrow mb-4">{String(i + 1).padStart(2, '0')} · {e.kicker}</p></Reveal>
            <h2 id={`${e.slug}-h`} className="h-display text-5xl sm:text-7xl"><MaskText text={e.title} /></h2>
            <Reveal delay={0.1}><p className="mt-6 text-lg leading-relaxed text-cream/75">{e.long}</p></Reveal>
            <Reveal delay={0.2}><ul className="mt-6 space-y-2">{e.notes.map((n) => <li key={n} className="flex items-start gap-3 text-sm text-cream/65"><Check size={16} className="mt-0.5 shrink-0 text-gold" />{n}</li>)}</ul></Reveal>
            <Reveal delay={0.3}><button onClick={() => enquire(e.title)} className="btn btn-gold mt-8"><MessageCircle size={16} /> Enquire</button></Reveal>
          </div>
        </section>
      ))}
    </div>
  );
}
