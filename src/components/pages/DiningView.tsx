'use client';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useMenu } from '@/hooks/useData';
import { Skeleton, ErrorNote, WakingNote } from '@/components/ui/Skeleton';
import { Reveal } from '@/components/ui/Motion';
import { TiltCard } from '@/components/ui/TiltCard';
import { photos, resolveImage } from '@/config/photos';
import { formatINR, cn } from '@/lib/format';
import type { MenuItem } from '@/types';

export function VegMark({ veg }: { veg: boolean }) {
  const c = veg ? '#3fae5f' : '#d2513f';
  return (
    <span role="img" aria-label={veg ? 'Vegetarian' : 'Non-vegetarian'} className="inline-grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[3px] border-2 bg-white/90" style={{ borderColor: c }}>
      {veg ? <span className="h-2 w-2 rounded-full" style={{ background: c }} /> : <span className="h-0 w-0 border-x-[4.5px] border-b-[8px] border-x-transparent" style={{ borderBottomColor: c }} />}
    </span>
  );
}

const imgFor = (m: MenuItem, i: number) => (m.imageUrl ? resolveImage(m.imageUrl) : photos.dining[i % photos.dining.length]);

function Dish({ m, i, big }: { m: MenuItem; i: number; big?: boolean }) {
  return (
    <TiltCard max={5} className="h-full rounded-3xl">
      <article className={cn('glass group flex h-full overflow-hidden rounded-3xl', big ? 'flex-col' : 'flex-row sm:flex-col')}>
        <div className={cn('relative shrink-0 overflow-hidden', big ? 'aspect-[16/10]' : 'w-28 sm:aspect-[16/10] sm:w-full')}>
          <img src={imgFor(m, i)} alt={m.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
          {m.isSignature && <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider text-forest-950"><Sparkles size={11} /> Signature</span>}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-3"><h3 className="flex items-start gap-2 font-display text-2xl leading-tight text-cream sm:text-3xl"><span className="mt-1.5"><VegMark veg={m.isVeg} /></span>{m.name}</h3><p className="font-display text-2xl text-gold-light">{formatINR(m.price)}</p></div>
          {m.description && <p className="mt-2 text-sm leading-relaxed text-cream/65">{m.description}</p>}
        </div>
      </article>
    </TiltCard>
  );
}

export function DiningView() {
  const { data, loading, error, waking, reload } = useMenu();
  const [cat, setCat] = useState('All');
  const cats = useMemo(() => { const seen: string[] = []; (data || []).slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).forEach((m) => { if (!seen.includes(m.category)) seen.push(m.category); }); return seen; }, [data]);
  const sig = (data || []).filter((m) => m.isSignature);
  const shown = (data || []).filter((m) => cat === 'All' || m.category === cat).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const grouped = cat === 'All' ? cats.map((c) => ({ c, items: shown.filter((m) => m.category === c) })) : [{ c: cat, items: shown }];

  return (
    <section className="container-x pb-10">
      {loading && <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-72 rounded-3xl" />)}<div className="col-span-full"><WakingNote show={waking} /></div></div>}
      {!loading && !data && error != null && <ErrorNote message="We could not load the menu right now." onRetry={reload} />}
      {!loading && data && data.length === 0 && <div className="glass mx-auto max-w-xl rounded-3xl p-10 text-center"><p className="font-display text-3xl">The menu is being prepared</p><p className="mt-2 text-sm text-cream/60">Please check back soon, or ask our team about today's dishes.</p></div>}
      {data && data.length > 0 && (
        <>
          {sig.length > 0 && cat === 'All' && (
            <div className="mb-16"><Reveal><p className="eyebrow mb-3">From the kitchen</p><h2 className="h-display mb-8 text-4xl sm:text-6xl">Signature <em className="text-gold-light">dishes</em></h2></Reveal>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{sig.slice(0, 3).map((m, i) => <Reveal key={m._id} delay={i * 0.1}><Dish m={m} i={i} big /></Reveal>)}</div></div>
          )}
          <div className="sticky top-[4.4rem] z-30 -mx-4 mb-10 border-y border-white/10 bg-forest-950/85 px-4 backdrop-blur-xl sm:mx-0 sm:rounded-full sm:border sm:px-3">
            <div role="tablist" aria-label="Menu categories" className="no-scrollbar flex gap-1 overflow-x-auto py-2">
              {['All', ...cats].map((c) => (
                <button key={c} role="tab" aria-selected={cat === c} onClick={() => setCat(c)} className={cn('relative shrink-0 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] transition', cat === c ? 'text-gold-light' : 'text-cream/60 hover:text-cream')}>
                  {c}{cat === c && <motion.span layoutId="menu-underline" className="absolute inset-x-4 bottom-0 h-0.5 rounded bg-gold" />}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-8 flex flex-wrap gap-5 text-xs text-cream/60"><span className="flex items-center gap-2"><VegMark veg /> Vegetarian</span><span className="flex items-center gap-2"><VegMark veg={false} /> Non-vegetarian</span></div>
          <AnimatePresence mode="wait">
            <motion.div key={cat} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }} className="space-y-14">
              {grouped.map(({ c, items }) => (
                <div key={c}><h2 className="mb-6 font-display text-4xl text-cream">{c}</h2>
                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{items.map((m, i) => <Dish key={m._id} m={m} i={i} />)}</div></div>
              ))}
            </motion.div>
          </AnimatePresence>
        </>
      )}
      <p className="mt-16 text-center text-xs text-cream/45">Prices in INR. The menu can change with the season. Please tell us about any dietary needs.</p>
    </section>
  );
}
