'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { photos } from '@/config/photos';
import { cn } from '@/lib/format';

const ratios = ['aspect-[4/5]', 'aspect-[4/3]', 'aspect-square', 'aspect-[3/4]', 'aspect-[16/11]', 'aspect-[4/5]'];

export function GalleryView() {
  const cats = useMemo(() => ['All', ...Array.from(new Set(photos.gallery.map((p) => p.category)))], []);
  const [cat, setCat] = useState('All');
  const [open, setOpen] = useState<number | null>(null);
  const list = useMemo(() => photos.gallery.filter((p) => cat === 'All' || p.category === cat), [cat]);
  const touch = useRef<number | null>(null);
  const trigger = useRef<HTMLElement | null>(null);

  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + list.length) % list.length)), [list.length]);
  useEffect(() => {
    if (open === null) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); };
    window.addEventListener('keydown', k);
    document.documentElement.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.documentElement.style.overflow = ''; trigger.current?.focus?.(); };
  }, [open, step]);

  return (
    <section className="container-x pb-10">
      <div role="tablist" aria-label="Gallery categories" className="mb-10 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button key={c} role="tab" aria-selected={cat === c} onClick={() => setCat(c)} className={cn('relative rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition', cat === c ? 'text-forest-950' : 'border border-white/15 text-cream/70 hover:border-gold hover:text-gold')}>
            {cat === c && <motion.span layoutId="gal-pill" className="absolute inset-0 rounded-full bg-gold" />}<span className="relative">{c}</span>
          </button>
        ))}
      </div>
      <motion.div layout className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
        <AnimatePresence mode="popLayout">
          {list.map((p, i) => (
            <motion.button layout key={p.src} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.45 }}
              onClick={(e) => { trigger.current = e.currentTarget; setOpen(i); }} aria-label={`Open photo: ${p.alt}`}
              className={cn('group relative block w-full break-inside-avoid overflow-hidden rounded-3xl border border-white/10', ratios[i % ratios.length])}>
              <img src={p.src} alt={p.alt} loading="lazy" className="h-full w-full object-cover transition duration-[1200ms] group-hover:scale-110" />
              <span className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
              <span className="absolute inset-x-0 bottom-0 translate-y-3 p-4 text-left text-sm text-cream opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">{p.alt}</span>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {open !== null && list[open] && (
          <motion.div role="dialog" aria-modal="true" aria-label="Photo viewer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] flex items-center justify-center bg-forest-950/95 backdrop-blur-md"
            onTouchStart={(e) => { touch.current = e.touches[0].clientX; }} onTouchEnd={(e) => { if (touch.current === null) return; const dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); touch.current = null; }}
            onClick={() => setOpen(null)}>
            <button aria-label="Close" autoFocus onClick={() => setOpen(null)} className="absolute right-4 top-4 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-cream transition hover:bg-gold hover:text-forest-950"><X size={22} /></button>
            <button aria-label="Previous photo" onClick={(e) => { e.stopPropagation(); step(-1); }} className="absolute left-3 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-cream transition hover:bg-gold hover:text-forest-950 sm:left-8"><ChevronLeft size={22} /></button>
            <button aria-label="Next photo" onClick={(e) => { e.stopPropagation(); step(1); }} className="absolute right-3 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-cream transition hover:bg-gold hover:text-forest-950 sm:right-8"><ChevronRight size={22} /></button>
            <AnimatePresence mode="wait">
              <motion.figure key={list[open].src} initial={{ opacity: 0, scale: 0.94, x: 30 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.96, x: -30 }} transition={{ duration: 0.35 }} className="max-h-[88vh] max-w-[92vw]" onClick={(e) => e.stopPropagation()}>
                <img src={list[open].src} alt={list[open].alt} className="max-h-[80vh] max-w-full rounded-2xl object-contain" />
                <figcaption className="mt-4 text-center text-sm text-cream/70">{list[open].alt} <span className="text-cream/40">· {open + 1} / {list.length}</span></figcaption>
              </motion.figure>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
