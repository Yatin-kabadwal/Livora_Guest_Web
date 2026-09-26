'use client';
import { useRef, useState, type PointerEvent, type KeyboardEvent } from 'react';
import { ChevronLeft, ChevronRight, Move3d } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useMedia';
import { cn } from '@/lib/format';

/**
 * 3D room viewer: photos sit on curved, tilted layers in real CSS 3D space.
 * Drag / swipe / arrow keys to rotate through them; the stage also tilts with the pointer.
 */
export function RoomViewer3D({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  const [drag, setDrag] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const start = useRef<number | null>(null);
  const reduce = useReducedMotion();
  const n = images.length;
  const go = (d: number) => setI((v) => Math.min(n - 1, Math.max(0, v + d)));

  const down = (e: PointerEvent<HTMLDivElement>) => { start.current = e.clientX; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (start.current !== null) setDrag(e.clientX - start.current);
    else if (!reduce && e.pointerType === 'mouse') { const r = e.currentTarget.getBoundingClientRect(); setTilt({ x: ((e.clientY - r.top) / r.height - 0.5) * -6, y: ((e.clientX - r.left) / r.width - 0.5) * 8 }); }
  };
  const up = () => {
    if (start.current === null) return;
    if (drag < -50) go(1); else if (drag > 50) go(-1);
    start.current = null; setDrag(0);
  };
  const key = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); };

  return (
    <div>
      <div
        role="group" aria-roledescription="carousel" aria-label={`${alt} photos, 3D viewer`} tabIndex={0} onKeyDown={key}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={() => { up(); setTilt({ x: 0, y: 0 }); }}
        className="relative aspect-[4/3] w-full cursor-grab select-none overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-forest-800 to-forest-950 active:cursor-grabbing sm:aspect-[16/10]"
        style={{ perspective: '1500px', touchAction: 'pan-y' }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(217,183,106,.12),transparent_65%)]" />
        <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d', transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transition: start.current === null ? 'transform .6s cubic-bezier(.22,1,.36,1)' : 'none' }}>
          {images.map((src, idx) => {
            const o = idx - i;
            const eff = o + drag / 360;
            const abs = Math.abs(eff);
            return (
              <button
                key={src + idx} type="button" onClick={() => { if (Math.abs(drag) < 6) setI(idx); }} aria-label={`Show photo ${idx + 1} of ${n}`} aria-current={idx === i}
                className="absolute left-1/2 top-1/2 h-[82%] w-[70%] overflow-hidden rounded-3xl border border-white/15 shadow-[0_30px_80px_-20px_rgba(0,0,0,.8)] outline-none focus-visible:ring-2 focus-visible:ring-gold"
                style={{
                  transform: `translate(-50%,-50%) translateX(${eff * 58}%) translateZ(${-abs * 260}px) rotateY(${-Math.max(-1.6, Math.min(1.6, eff)) * 34}deg) scale(${1 - Math.min(abs, 2) * 0.04})`,
                  opacity: abs > 2.3 ? 0 : 1 - abs * 0.28, zIndex: 10 - Math.round(abs),
                  transition: start.current === null ? 'transform .8s cubic-bezier(.22,1,.36,1), opacity .6s' : 'none',
                  pointerEvents: abs > 2.3 ? 'none' : 'auto',
                }}
              >
                <img src={src} alt={idx === i ? `${alt}, photo ${idx + 1}` : ''} draggable={false} className="h-full w-full object-cover" />
                {idx !== i && <span className="absolute inset-0 bg-forest-950/45" />}
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15" />
              </button>
            );
          })}
        </div>
        {n > 1 && (
          <>
            <button type="button" aria-label="Previous photo" onClick={() => go(-1)} disabled={i === 0} className="absolute left-3 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-forest-950/70 text-cream backdrop-blur transition hover:bg-gold hover:text-forest-950 disabled:opacity-30"><ChevronLeft size={20} /></button>
            <button type="button" aria-label="Next photo" onClick={() => go(1)} disabled={i === n - 1} className="absolute right-3 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-forest-950/70 text-cream backdrop-blur transition hover:bg-gold hover:text-forest-950 disabled:opacity-30"><ChevronRight size={20} /></button>
            <span className="pointer-events-none absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-forest-950/70 px-3 py-1.5 text-[0.68rem] uppercase tracking-widest text-cream/70 backdrop-blur"><Move3d size={12} className="text-gold" /> Drag to explore</span>
          </>
        )}
      </div>
      {n > 1 && (
        <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label="Photo selector">
          {images.map((src, idx) => (
            <button key={idx} role="tab" aria-selected={idx === i} aria-label={`Photo ${idx + 1}`} onClick={() => setI(idx)} className={cn('h-14 w-20 overflow-hidden rounded-xl border-2 transition', idx === i ? 'scale-105 border-gold' : 'border-transparent opacity-60 hover:opacity-100')}>
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
