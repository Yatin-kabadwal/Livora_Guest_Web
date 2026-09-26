import { formatINR, pluralize } from '@/lib/format';

interface Line { nights: number; pricePerNight: number; roomAmount: number; mealAmount: number; discountAmount: number; promoCode?: string; total: number; baseAmount: number; gstRate: number; gstAmount: number; extrasTotal?: number }

export function PriceBreakdown({ q, compact }: { q: Line; compact?: boolean }) {
  const row = 'flex items-baseline justify-between gap-4 py-1.5 text-sm';
  return (
    <dl className="text-cream/80">
      <div className={row}><dt>{formatINR(q.pricePerNight)} × {pluralize(q.nights, 'night')}</dt><dd>{formatINR(q.roomAmount)}</dd></div>
      {q.mealAmount > 0 && <div className={row}><dt>Meals</dt><dd>{formatINR(q.mealAmount)}</dd></div>}
      {!!q.extrasTotal && q.extrasTotal > 0 && <div className={row}><dt>Extras</dt><dd>{formatINR(q.extrasTotal)}</dd></div>}
      {q.discountAmount > 0 && <div className={`${row} text-sage`}><dt>Promo {q.promoCode}</dt><dd>-{formatINR(q.discountAmount)}</dd></div>}
      {!compact && (
        <div className="mt-2 space-y-0.5 border-t border-white/10 pt-2 text-xs text-cream/50">
          <div className="flex justify-between"><dt>Taxable value</dt><dd>{formatINR(q.baseAmount)}</dd></div>
          <div className="flex justify-between"><dt>CGST ({(q.gstRate * 50).toFixed(0)}%)</dt><dd>{formatINR(q.gstAmount / 2)}</dd></div>
          <div className="flex justify-between"><dt>SGST ({(q.gstRate * 50).toFixed(0)}%)</dt><dd>{formatINR(q.gstAmount / 2)}</dd></div>
        </div>
      )}
      <div className="mt-3 flex items-baseline justify-between border-t border-gold/30 pt-3"><dt className="text-xs uppercase tracking-[0.2em] text-gold">Total (incl. GST)</dt><dd className="font-display text-4xl text-gold-light">{formatINR(q.total)}</dd></div>
    </dl>
  );
}
