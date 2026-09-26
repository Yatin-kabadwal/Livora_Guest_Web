'use client';
import { useEffect, useRef, useState } from 'react';
import { DayPicker, type DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, Minus, Plus, Users } from 'lucide-react';
import { formatDate, fromYmd, ymd, nightsBetween, pluralize, cn } from '@/lib/format';
import { useIsMobile } from '@/hooks/useMedia';
import { addDays, startOfToday } from 'date-fns';

function useClickAway(ref: React.RefObject<HTMLElement>, on: () => void, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const h = (e: MouseEvent | TouchEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) on(); };
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') on(); };
    document.addEventListener('mousedown', h);
    document.addEventListener('touchstart', h);
    document.addEventListener('keydown', k);
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('touchstart', h); document.removeEventListener('keydown', k); };
  }, [ref, on, active]);
}

interface DRProps {
  checkIn?: string;
  checkOut?: string;
  onChange: (v: { checkIn?: string; checkOut?: string }) => void;
  placement?: 'down' | 'up';
  className?: string;
  label?: string;
  compact?: boolean;
}

export function DateRangeField({ checkIn, checkOut, onChange, placement = 'down', className, label = 'Dates', compact }: DRProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const mobile = useIsMobile();
  useClickAway(ref, () => setOpen(false), open);
  const from = fromYmd(checkIn);
  const to = fromYmd(checkOut);
  const n = nightsBetween(from, to);
  const today = startOfToday();

  const handle = (r: DateRange | undefined, picked: Date) => {
    // Restart selection if a full range already exists
    if (from && to) { onChange({ checkIn: ymd(picked), checkOut: undefined }); return; }
    if (from && !to) {
      if (picked > from) { onChange({ checkIn: ymd(from), checkOut: ymd(picked) }); setOpen(false); }
      else onChange({ checkIn: ymd(picked), checkOut: undefined });
      return;
    }
    void r;
    onChange({ checkIn: ymd(picked), checkOut: undefined });
  };

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn('flex w-full items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.04] text-left transition hover:border-gold/60', compact ? 'px-4 py-3' : 'px-4 py-3.5')}
      >
        <CalendarDays size={18} className="shrink-0 text-gold" />
        <span className="min-w-0">
          <span className="block text-[0.65rem] uppercase tracking-[0.18em] text-gold">{label}</span>
          <span className="block truncate text-sm text-cream">
            {from ? formatDate(from) : 'Check-in'} <span className="text-cream/40">→</span> {to ? formatDate(to) : 'Check-out'}
            {n > 0 && <span className="ml-2 text-cream/50">· {pluralize(n, 'night')}</span>}
          </span>
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <>
            {mobile && <div className="fixed inset-0 z-[70] bg-forest-950/70" aria-hidden="true" />}
            <motion.div
              role="dialog"
              aria-label="Choose your dates"
              initial={{ opacity: 0, y: placement === 'up' ? 10 : -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: placement === 'up' ? 10 : -10 }}
              transition={{ duration: 0.25 }}
              className={cn('glass-solid z-[80] rounded-3xl p-4 shadow-glass',
                'fixed inset-x-3 bottom-3 sm:absolute sm:inset-x-auto sm:left-0 sm:bottom-auto',
                placement === 'up' ? 'sm:bottom-full sm:mb-3' : 'sm:top-full sm:mt-3')}
            >
              <div className="flex justify-center overflow-x-auto">
                <DayPicker
                  mode="range"
                  numberOfMonths={mobile ? 1 : 2}
                  selected={from ? { from, to } : undefined}
                  onSelect={handle as never}
                  disabled={{ before: today }}
                  defaultMonth={from || today}
                  weekStartsOn={1}
                  fromDate={today}
                  toDate={addDays(today, 540)}
                />
              </div>
              <div className="mt-2 flex items-center justify-between px-2 text-xs text-cream/60">
                <span>{!from ? 'Select your check-in day' : !to ? 'Now select check-out' : `${pluralize(n, 'night')} selected`}</span>
                <button type="button" className="text-gold hover:underline" onClick={() => { onChange({}); }}>Clear</button>
                {mobile && <button type="button" className="btn btn-gold btn-sm" onClick={() => setOpen(false)}>Done</button>}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

interface GProps {
  adults: number;
  kids: number;
  onChange: (v: { adults: number; children: number }) => void;
  placement?: 'down' | 'up';
  className?: string;
  maxAdults?: number;
  maxChildren?: number;
  compact?: boolean;
}

export function GuestsField({ adults, kids, onChange, placement = 'down', className, maxAdults = 12, maxChildren = 8, compact }: GProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickAway(ref, () => setOpen(false), open);
  const Row = ({ label, sub, value, min, max, set }: { label: string; sub: string; value: number; min: number; max: number; set: (n: number) => void }) => (
    <div className="flex items-center justify-between gap-6 py-2">
      <div><p className="text-sm text-cream">{label}</p><p className="text-xs text-cream/50">{sub}</p></div>
      <div className="flex items-center gap-3">
        <button type="button" aria-label={`Fewer ${label.toLowerCase()}`} disabled={value <= min} onClick={() => set(value - 1)} className="grid h-8 w-8 place-items-center rounded-full border border-white/20 text-cream transition hover:border-gold hover:text-gold disabled:opacity-30"><Minus size={14} /></button>
        <span className="w-5 text-center tabular-nums" aria-live="polite">{value}</span>
        <button type="button" aria-label={`More ${label.toLowerCase()}`} disabled={value >= max} onClick={() => set(value + 1)} className="grid h-8 w-8 place-items-center rounded-full border border-white/20 text-cream transition hover:border-gold hover:text-gold disabled:opacity-30"><Plus size={14} /></button>
      </div>
    </div>
  );
  return (
    <div ref={ref} className={cn('relative', className)}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="dialog" aria-expanded={open}
        className={cn('flex w-full items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.04] text-left transition hover:border-gold/60', compact ? 'px-4 py-3' : 'px-4 py-3.5')}>
        <Users size={18} className="shrink-0 text-gold" />
        <span>
          <span className="block text-[0.65rem] uppercase tracking-[0.18em] text-gold">Guests</span>
          <span className="block text-sm text-cream">{pluralize(adults, 'adult')}{kids > 0 && `, ${pluralize(kids, 'child', 'children')}`}</span>
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div role="dialog" aria-label="Guests" initial={{ opacity: 0, y: placement === 'up' ? 10 : -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={cn('glass-solid absolute left-0 z-[80] w-72 rounded-2xl p-4 shadow-glass', placement === 'up' ? 'bottom-full mb-3' : 'top-full mt-3')}>
            <Row label="Adults" sub="Age 13 and above" value={adults} min={1} max={maxAdults} set={(v) => onChange({ adults: v, children: kids })} />
            <Row label="Children" sub="Age 12 and under" value={kids} min={0} max={maxChildren} set={(v) => onChange({ adults, children: v })} />
            <button type="button" onClick={() => setOpen(false)} className="btn btn-gold btn-sm mt-3 w-full">Done</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
