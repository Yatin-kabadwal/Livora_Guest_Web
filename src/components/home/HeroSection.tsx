'use client';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
import { Moon, Sun, Sunset, ChevronDown, Search } from 'lucide-react';
import { photos } from '@/config/photos';
import { MaskText } from '@/components/ui/Motion';
import { Btn } from '@/components/ui/Button';
import { DateRangeField, GuestsField } from '@/components/ui/DateRange';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useReducedMotion } from '@/hooks/useMedia';
import { usePreloaded } from '@/hooks/usePreloaded';
import { cn } from '@/lib/format';
import type { TimeMode, Quality } from '@/components/three/HeroScene';

const HeroScene = dynamic(() => import('@/components/three/HeroScene'), { ssr: false });

const MODES: { id: TimeMode; label: string; Icon: typeof Sun }[] = [
  { id: 'day', label: 'Day', Icon: Sun },
  { id: 'dusk', label: 'Dusk', Icon: Sunset },
  { id: 'night', label: 'Night', Icon: Moon },
];
const TINT: Record<TimeMode, string> = {
  day: 'rgba(255,245,210,0.06)',
  dusk: 'rgba(224,122,63,0.28)',
  night: 'rgba(3,12,24,0.62)',
};

function webglOk(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}

export function HeroSection() {
  const router = useRouter();
  const wrap = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const reduce = useReducedMotion();
  const go = usePreloaded();
  const [mode, setMode] = useState<TimeMode>('dusk');
  const [use3D, setUse3D] = useState(false);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const [quality, setQuality] = useState<Quality>('high');
  const [q, setQ] = useState<{ checkIn?: string; checkOut?: string; adults: number; children: number }>({ adults: 2, children: 0 });

  // capability detection (after mount => no hydration mismatch)
  useEffect(() => {
    if (reduce) { setUse3D(false); return; }
    if (!webglOk()) return;
    const nav = navigator as Navigator & { deviceMemory?: number };
    const low = window.innerWidth < 768 || (nav.hardwareConcurrency || 8) <= 4 || (nav.deviceMemory || 8) <= 4;
    setQuality(low ? 'low' : 'high');
    setUse3D(true);
  }, [reduce]);

  // pointer parallax + device tilt
  useEffect(() => {
    if (!use3D) return;
    const move = (e: PointerEvent) => { pointerRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2; pointerRef.current.y = -(e.clientY / window.innerHeight - 0.5) * 2; };
    const tilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      pointerRef.current.x = Math.max(-1, Math.min(1, e.gamma / 28));
      pointerRef.current.y = Math.max(-1, Math.min(1, -(e.beta - 50) / 28));
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('deviceorientation', tilt);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('deviceorientation', tilt); };
  }, [use3D]);

  // render only while visible
  useEffect(() => {
    const el = wrap.current; if (!el) return;
    let inView = true;
    const upd = () => setVisible(inView && !document.hidden);
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; upd(); }, { threshold: 0 });
    io.observe(el);
    document.addEventListener('visibilitychange', upd);
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', upd); };
  }, []);

  const { scrollYProgress } = useScroll({ target: wrap, offset: ['start start', 'end end'] });
  useMotionValueEvent(scrollYProgress, 'change', (v) => { progressRef.current = Math.min(1, Math.max(0, v)); });
  const textOpacity = useTransform(scrollYProgress, [0, 0.28], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);
  const barOpacity = useTransform(scrollYProgress, [0.12, 0.3], [1, 0]);

  const search = () => {
    const p = new URLSearchParams();
    if (q.checkIn) p.set('checkIn', q.checkIn);
    if (q.checkOut) p.set('checkOut', q.checkOut);
    p.set('adults', String(q.adults));
    if (q.children) p.set('children', String(q.children));
    router.push(`/booking?${p.toString()}`);
  };

  return (
    <div ref={wrap} className={cn('relative', reduce ? 'h-[100svh]' : 'h-[165vh] md:h-[180vh]')}>
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-forest-950">
        {/* static fallback / loading poster */}
        <div className={cn('absolute inset-0 transition-opacity duration-1000', use3D && ready ? 'opacity-0' : 'opacity-100')}>
          <img src={photos.hero[0]} alt="Mist over the Sal forest at the edge of Jim Corbett" className="h-full w-full animate-kenburns object-cover" fetchPriority="high" />
          <div className="absolute inset-0 transition-colors duration-1000" style={{ background: TINT[mode] }} />
        </div>
        {use3D && (
          <div className={cn('absolute inset-0 transition-opacity duration-[1400ms]', ready ? 'opacity-100' : 'opacity-0')}>
            <ErrorBoundary fallback={null} onError={() => setUse3D(false)}>
              <HeroScene mode={mode} quality={quality} visible={visible} progressRef={progressRef} pointerRef={pointerRef} onReady={() => setReady(true)} />
            </ErrorBoundary>
          </div>
        )}
        {/* legibility gradients */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-forest-950/70 via-transparent to-forest-950/90" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(7,17,12,.55)_100%)]" />

        <motion.div style={reduce ? undefined : { opacity: textOpacity, y: textY }} className="relative z-10 flex h-full flex-col justify-center px-4 pb-56 pt-28 sm:px-8 md:pb-40 lg:px-14">
          <div className="mx-auto w-full max-w-[88rem]">
            <motion.p initial={{ opacity: 0, y: 12 }} animate={go ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.9 }} className="eyebrow mb-5 flex items-center gap-3 text-shadow">
              <span className="h-px w-10 bg-gold" /> Jim Corbett, Uttarakhand · 10 private rooms
            </motion.p>
            <h1 className="h-display max-w-5xl text-[3.4rem] leading-[0.95] text-cream text-shadow sm:text-[5.5rem] lg:text-[8.5rem]">
              <MaskText text="Wake up inside" hold={!go} className="block" delay={0.1} />
              <MaskText text="the forest." hold={!go} className="block" delay={0.4} italicWords={['forest']} />
            </h1>
            <motion.p initial={{ opacity: 0, y: 14 }} animate={go ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1, delay: 0.9 }} className="mt-6 max-w-xl text-base leading-relaxed text-cream/80 text-shadow sm:text-lg">
              A quiet sanctuary of Sal, mist and birdsong at the edge of Jim Corbett National Park. Hosted by Livora.
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={go ? { opacity: 1 } : {}} transition={{ delay: 1.2 }} className="mt-8 hidden flex-wrap items-center gap-4 md:flex">
              <Btn href="/rooms">Explore rooms</Btn>
              <Btn href="/about" variant="ghost">Our story</Btn>
            </motion.div>
          </div>
        </motion.div>

        {/* time-of-day toggle */}
        {use3D && (
          <div role="radiogroup" aria-label="Time of day" className="glass absolute right-4 top-24 z-20 flex rounded-full p-1 sm:right-8 md:top-28">
            {MODES.map(({ id, label, Icon }) => (
              <button key={id} role="radio" aria-checked={mode === id} onClick={() => setMode(id)}
                className={cn('flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wider transition', mode === id ? 'bg-gold text-forest-950' : 'text-cream/75 hover:text-gold')}>
                <Icon size={14} /> <span className="hidden sm:inline">{label}</span><span className="sr-only sm:hidden">{label}</span>
              </button>
            ))}
          </div>
        )}
        {!use3D && (
          <div role="radiogroup" aria-label="Time of day" className="glass absolute right-4 top-24 z-20 flex rounded-full p-1 sm:right-8 md:top-28">
            {MODES.map(({ id, label, Icon }) => (
              <button key={id} role="radio" aria-checked={mode === id} onClick={() => setMode(id)} aria-label={label}
                className={cn('flex items-center gap-1.5 rounded-full px-3 py-2 text-xs transition', mode === id ? 'bg-gold text-forest-950' : 'text-cream/75 hover:text-gold')}><Icon size={14} /></button>
            ))}
          </div>
        )}

        {/* availability bar */}
        <motion.div style={reduce ? undefined : { opacity: barOpacity }} className="absolute inset-x-0 bottom-20 z-20 px-4 sm:px-8 md:bottom-12 lg:px-14">
          <motion.form
            onSubmit={(e) => { e.preventDefault(); search(); }}
            initial={{ opacity: 0, y: 30 }} animate={go ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="glass mx-auto grid max-w-5xl grid-cols-2 items-stretch gap-2 rounded-3xl p-2.5 md:grid-cols-[1.6fr_1fr_auto] md:rounded-full md:p-2"
            aria-label="Check availability"
          >
            <DateRangeField checkIn={q.checkIn} checkOut={q.checkOut} onChange={(v) => setQ((s) => ({ ...s, ...v }))} placement="up" className="col-span-2 md:col-span-1 [&>button]:border-transparent [&>button]:bg-transparent md:[&>button]:rounded-full" />
            <GuestsField adults={q.adults} kids={q.children} onChange={(v) => setQ((s) => ({ ...s, ...v }))} placement="up" className="[&>button]:border-transparent [&>button]:bg-transparent md:[&>button]:rounded-full" />
            <button type="submit" className="btn btn-gold px-3 py-3.5 text-xs md:px-9 md:text-[.85rem]"><Search size={16} /> Check availability</button>
          </motion.form>
        </motion.div>

        <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 hidden -translate-x-1/2 text-gold/70 md:block" aria-hidden="true">
          <ChevronDown className="animate-bounce" size={22} />
        </div>
      </div>
    </div>
  );
}
