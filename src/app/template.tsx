'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

let navCount = 0;

/** Re-mounts on every navigation: green curtain wipe + content rise. */
export default function Template({ children }: { children: ReactNode }) {
  const [wipe, setWipe] = useState(false);
  useEffect(() => {
    if (navCount++ === 0) return; // first load is handled by the preloader
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setWipe(true);
    const t = setTimeout(() => setWipe(false), 1100);
    return () => clearTimeout(t);
  }, []);
  return (
    <>
      <div className="page-enter">{children}</div>
      <AnimatePresence>
        {wipe && (
          <motion.div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[85] bg-forest-800" initial={{ y: 0 }} animate={{ y: '-100%' }} exit={{ y: '-100%' }} transition={{ duration: 0.95, ease: [0.76, 0, 0.24, 1], delay: 0.05 }}>
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-gold/30 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
