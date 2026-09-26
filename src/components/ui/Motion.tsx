'use client';
import { motion, useInView, useScroll, useTransform, animate, useMotionValue, type Variants } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from '@/hooks/useMedia';
import { cn } from '@/lib/format';

const ease = [0.22, 1, 0.36, 1] as const;

/** Fade + rise when scrolled into view. */
export function Reveal({ children, delay = 0, y = 32, className, as = 'div', once = true }: { children: ReactNode; delay?: number; y?: number; className?: string; as?: 'div' | 'li' | 'section' | 'p'; once?: boolean }) {
  const reduce = useReducedMotion();
  const M = motion[as] as typeof motion.div;
  return (
    <M
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.9, delay, ease }}
    >
      {children}
    </M>
  );
}

const wordV: Variants = {
  hidden: { y: '110%' },
  show: (i: number) => ({ y: 0, transition: { duration: 0.9, delay: i * 0.06, ease } }),
};

/** Masked word-by-word headline reveal. `text` may contain "\n" for line breaks. */
export function MaskText({ text, className, delay = 0, italicWords = [], instant = false, hold = false }: { text: string; className?: string; delay?: number; italicWords?: string[]; instant?: boolean; hold?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const reduce = useReducedMotion();
  const words = text.split(/\s+/);
  const on = !hold && (instant || inView || reduce);
  return (
    <span ref={ref} className={cn('inline-block', className)} aria-label={text.replace(/\n/g, ' ')}>
      {words.map((w, i) => (
        <span key={i} aria-hidden="true" className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em]">
          <motion.span
            className={cn('inline-block', italicWords.includes(w.replace(/[.,]/g, '')) && 'italic text-gold-light')}
            variants={wordV}
            custom={i + delay * 10}
            initial="hidden"
            animate={on ? 'show' : 'hidden'}
          >
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** Animated counting number. */
export function Counter({ to, suffix = '', prefix = '', duration = 2 }: { to: number; suffix?: string; prefix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const [val, setVal] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!inView) return;
    if (reduce) { setVal(to); return; }
    const c = animate(mv, to, { duration, ease: 'easeOut', onUpdate: (v) => setVal(Math.round(v)) });
    return () => c.stop();
  }, [inView, to, duration, mv, reduce]);
  return <span ref={ref}>{prefix}{val}{suffix}</span>;
}

/** Image with scroll parallax. Parent should have overflow hidden + fixed height. */
export function ParallaxImage({ src, alt, className, amount = 12 }: { src: string; alt: string; className?: string; amount?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${amount}%`, `${amount}%`]);
  const reduce = useReducedMotion();
  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={reduce ? undefined : { y, scale: 1 + (amount / 100) * 2.2 }}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}

/** Infinite marquee. */
export function Marquee({ items, className }: { items: string[]; className?: string }) {
  const list = [...items, ...items];
  return (
    <div className={cn('overflow-hidden whitespace-nowrap', className)} aria-hidden="true">
      <div className="flex w-max animate-marquee items-center gap-10 will-change-transform">
        {list.map((t, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-3xl italic text-cream/80 md:text-5xl">
            {t}
            <span className="inline-block h-2 w-2 rotate-45 bg-gold" />
          </span>
        ))}
      </div>
    </div>
  );
}
