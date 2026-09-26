'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LogoMark } from '@/components/ui/Logo';

const KEY = 'cvl_pre';

/** First visit per session: logo draws itself, counter runs, curtain lifts. */
export function Preloader() {
  const [show, setShow] = useState(true);
  const [pct, setPct] = useState(0);
  const [lift, setLift] = useState(false);

  useEffect(() => {
    const el = document.documentElement;
    let seen = false;
    try { seen = sessionStorage.getItem(KEY) === '1'; } catch { /* ignore */ }
    if (seen) { el.dataset.pre = '1'; el.dataset.preDone = '1'; setShow(false); return; }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dur = reduce ? 500 : 2600;
    el.style.overflow = 'hidden';
    const t0 = performance.now();
    let raf = 0, finished = false;
    const finish = () => {
      if (finished) return; finished = true;
      setLift(true);
      try { sessionStorage.setItem(KEY, '1'); } catch { /* ignore */ }
      setTimeout(() => { el.style.overflow = ''; el.dataset.preDone = '1'; window.dispatchEvent(new Event('cvl-preloaded')); }, reduce ? 100 : 700);
      setTimeout(() => setShow(false), reduce ? 200 : 1500);
    };
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setPct(Math.round(p * p * (3 - 2 * p) * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else if (document.readyState === 'complete') finish();
      else window.addEventListener('load', finish, { once: true });
    };
    raf = requestAnimationFrame(tick);
    const safety = setTimeout(finish, 6000);
    return () => { cancelAnimationFrame(raf); clearTimeout(safety); el.style.overflow = ''; };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <div id="preloader" className="fixed inset-0 z-[300]" role="status" aria-label="Loading Corbett The Vedant By Livora">
          <motion.div className="absolute inset-x-0 top-0 h-1/2 bg-forest-950" animate={{ y: lift ? '-100%' : 0 }} transition={{ duration: 1, ease: [0.76, 0, 0.24, 1], delay: 0.1 }} />
          <motion.div className="absolute inset-x-0 bottom-0 h-1/2 bg-forest-950" animate={{ y: lift ? '100%' : 0 }} transition={{ duration: 1, ease: [0.76, 0, 0.24, 1], delay: 0.1 }} />
          <motion.div className="absolute inset-0 flex flex-col items-center justify-center" animate={{ opacity: lift ? 0 : 1, scale: lift ? 1.08 : 1 }} transition={{ duration: 0.5 }}>
            <LogoMark draw className="h-28 w-28 sm:h-36 sm:w-36" />
            <p className="mt-8 font-display text-2xl tracking-[0.35em] text-cream sm:text-3xl">CORBETT THE VEDANT</p>
            <p className="mt-1 text-[0.65rem] font-semibold tracking-[0.5em] text-gold">BY LIVORA</p>
            <div className="mt-10 h-px w-48 overflow-hidden bg-white/10"><div className="h-full bg-gold transition-[width] duration-100" style={{ width: `${pct}%` }} /></div>
            <p className="mt-3 font-display text-3xl tabular-nums text-gold-light">{String(pct).padStart(2, '0')}</p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
