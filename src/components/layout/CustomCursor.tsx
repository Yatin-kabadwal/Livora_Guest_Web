'use client';
import { useEffect, useRef } from 'react';

/** Cursor follower: desktop fine pointers only. */
export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine) and (hover: hover)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;
    const root = document.documentElement;
    root.classList.add('has-cursor');
    let x = -100, y = -100, rx = -100, ry = -100, raf = 0, hover = false, down = false;
    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      const t = e.target as HTMLElement | null;
      hover = !!t?.closest?.('a,button,[role="button"],input,textarea,select,label,[data-cursor]');
      if (dot.current) dot.current.style.opacity = '1';
      if (ring.current) ring.current.style.opacity = '1';
    };
    const leave = () => { if (dot.current) dot.current.style.opacity = '0'; if (ring.current) ring.current.style.opacity = '0'; };
    const md = () => { down = true; }; const mu = () => { down = false; };
    const loop = () => {
      rx += (x - rx) * 0.16; ry += (y - ry) * 0.16;
      if (dot.current) dot.current.style.transform = `translate3d(${x - 3}px,${y - 3}px,0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${rx - 20}px,${ry - 20}px,0) scale(${down ? 0.8 : hover ? 1.7 : 1})`;
      if (ring.current) ring.current.style.background = hover ? 'rgba(217,183,106,.14)' : 'transparent';
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    window.addEventListener('pointerdown', md); window.addEventListener('pointerup', mu);
    return () => {
      cancelAnimationFrame(raf); root.classList.remove('has-cursor');
      window.removeEventListener('pointermove', move); document.removeEventListener('pointerleave', leave);
      window.removeEventListener('pointerdown', md); window.removeEventListener('pointerup', mu);
    };
  }, []);
  return (
    <>
      <div ref={ring} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[200] h-10 w-10 rounded-full border border-gold/70 opacity-0 transition-[opacity,background] duration-300" />
      <div ref={dot} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[201] h-1.5 w-1.5 rounded-full bg-gold opacity-0" />
    </>
  );
}
