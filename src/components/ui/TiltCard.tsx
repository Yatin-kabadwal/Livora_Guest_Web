'use client';
import { useRef, type ReactNode, type PointerEvent } from 'react';
import { cn } from '@/lib/format';
import { useReducedMotion } from '@/hooks/useMedia';

/** Perspective tilt with a glare highlight that follows the pointer. */
export function TiltCard({ children, className, max = 9, glare = true }: { children: ReactNode; className?: string; max?: number; glare?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const raf = useRef(0);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType === 'touch') return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max * 1.2}deg) translateZ(0) scale3d(1.015,1.015,1.015)`;
      if (glareRef.current) {
        glareRef.current.style.opacity = '1';
        glareRef.current.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,240,200,.28), transparent 55%)`;
      }
    });
  };
  const onLeave = () => {
    cancelAnimationFrame(raf.current);
    const el = ref.current;
    if (el) el.style.transform = 'perspective(900px) rotateX(0) rotateY(0) scale3d(1,1,1)';
    if (glareRef.current) glareRef.current.style.opacity = '0';
  };
  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn('relative will-change-transform', className)}
      style={{ transition: 'transform .35s cubic-bezier(.22,1,.36,1)', transformStyle: 'preserve-3d' }}
    >
      {children}
      {glare && <div ref={glareRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] opacity-0 transition-opacity duration-300 mix-blend-soft-light" />}
    </div>
  );
}
