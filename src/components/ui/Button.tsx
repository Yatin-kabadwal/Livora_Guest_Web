'use client';
import Link from 'next/link';
import { useRef, type ReactNode, type MouseEvent } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { cn } from '@/lib/format';
import { useFinePointer, useReducedMotion } from '@/hooks/useMedia';

/** Wrap anything to make it drift toward the pointer. */
export function Magnetic({ children, strength = 0.28, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  if (!fine || reduce) return <div className={cn('inline-block', className)}>{children}</div>;
  const move = (e: MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const leave = () => { x.set(0); y.set(0); };
  return (
    <motion.div ref={ref} onMouseMove={move} onMouseLeave={leave} style={{ x: sx, y: sy }} className={cn('inline-block', className)}>
      {children}
    </motion.div>
  );
}

interface BtnProps {
  children: ReactNode;
  href?: string;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  variant?: 'gold' | 'ghost';
  size?: 'md' | 'sm';
  className?: string;
  magnetic?: boolean;
  type?: 'button' | 'submit';
  disabled?: boolean;
  external?: boolean;
  ariaLabel?: string;
  download?: boolean;
}

export function Btn({ children, href, onClick, variant = 'gold', size = 'md', className, magnetic = true, type = 'button', disabled, external, ariaLabel, download }: BtnProps) {
  const cls = cn('btn', variant === 'gold' ? 'btn-gold' : 'btn-ghost', size === 'sm' && 'btn-sm', className);
  let el: ReactNode;
  if (href && external) el = <a href={href} target="_blank" rel="noopener noreferrer" className={cls} aria-label={ariaLabel} onClick={onClick} download={download}>{children}</a>;
  else if (href) el = <Link href={href} className={cls} aria-label={ariaLabel} onClick={onClick}>{children}</Link>;
  else el = <button type={type} onClick={onClick} disabled={disabled} className={cls} aria-label={ariaLabel}>{children}</button>;
  return magnetic && !disabled ? <Magnetic>{el}</Magnetic> : <>{el}</>;
}
