'use client';
import { useEffect, useState } from 'react';

/** true once the preloader curtain has lifted (or was skipped this session). */
export function usePreloaded() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const el = document.documentElement;
    if (el.dataset.pre === '1' || el.dataset.preDone === '1') { setDone(true); return; }
    const on = () => setDone(true);
    window.addEventListener('cvl-preloaded', on);
    return () => window.removeEventListener('cvl-preloaded', on);
  }, []);
  return done;
}
