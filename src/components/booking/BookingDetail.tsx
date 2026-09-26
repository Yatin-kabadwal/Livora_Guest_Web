import { Check, Clock, LogIn, LogOut, Ban } from 'lucide-react';
import { PriceBreakdown } from './PriceBreakdown';
import { formatINR, formatStayLong, formatDateTime, statusLabel, pluralize, cn } from '@/lib/format';
import type { Booking } from '@/types';

const STATUS_STYLE: Record<string, string> = {
  confirmed: 'border-sage/60 bg-sage/10 text-sage', checked_in: 'border-gold/60 bg-gold/10 text-gold-light', checked_out: 'border-white/30 text-cream/80',
  cancelled: 'border-ember/60 bg-ember/10 text-ember', no_show: 'border-ember/60 bg-ember/10 text-ember',
};
export const StatusChip = ({ status }: { status: string }) => <span className={cn('chip', STATUS_STYLE[status])}>{statusLabel(status)}</span>;

function Timeline({ b }: { b: Booking }) {
  const cancelled = b.status === 'cancelled' || b.status === 'no_show';
  const steps = cancelled
    ? [{ l: 'Booked', d: b.createdAt, done: true, Icon: Check }, { l: b.status === 'no_show' ? 'No show' : 'Cancelled', d: b.cancelledAt, done: true, Icon: b.status === 'no_show' ? Clock : Ban, bad: true }]
    : [{ l: 'Booked', d: b.createdAt, done: true, Icon: Check }, { l: 'Checked in', d: b.actualCheckIn, done: b.status === 'checked_in' || b.status === 'checked_out', Icon: LogIn }, { l: 'Checked out', d: b.actualCheckOut, done: b.status === 'checked_out', Icon: LogOut }];
  return (
    <ol className="flex items-start" aria-label="Booking progress">
      {steps.map((s, i) => (
        <li key={s.l} className="relative flex-1 text-center">
          {i > 0 && <span className={cn('absolute right-1/2 top-5 h-px w-full', s.done ? (s.bad ? 'bg-ember/60' : 'bg-gold') : 'bg-white/15')} aria-hidden="true" />}
          <span className={cn('relative mx-auto grid h-10 w-10 place-items-center rounded-full border', s.done ? (s.bad ? 'border-ember bg-ember text-forest-950' : 'border-gold bg-gold text-forest-950') : 'border-white/20 text-cream/40')}><s.Icon size={16} /></span>
          <p className={cn('mt-2 text-xs font-semibold uppercase tracking-wider', s.done ? 'text-cream' : 'text-cream/40')}>{s.l}</p>
          {s.d && <p className="text-[0.68rem] text-cream/45">{formatDateTime(s.d)}</p>}
        </li>
      ))}
    </ol>
  );
}

export function BookingDetail({ b }: { b: Booking }) {
  const balance = b.balanceDue ?? Math.max(0, b.totalAmount - (b.paidAmount || 0));
  return (
    <div className="space-y-6">
      <div className="glass rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="eyebrow">Booking reference</p><p className="mt-1 font-display text-4xl tracking-wide text-gold-light">{b.bookingRef}</p></div>
          <StatusChip status={b.status} />
        </div>
        <div className="mt-8"><Timeline b={b} /></div>
        {b.status === 'cancelled' && b.cancelReason && <p className="mt-6 rounded-xl bg-white/5 p-3 text-sm text-cream/70">Reason: {b.cancelReason}</p>}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass rounded-[2rem] p-6 sm:p-8">
          <h2 className="font-display text-3xl">Your stay</h2>
          <dl className="mt-4 space-y-3 text-sm">
            {[['Room', b.roomName], ['Check-in', formatStayLong(b.checkIn)], ['Check-out', formatStayLong(b.checkOut)], ['Nights', String(b.nights)],
              ['Guests', `${pluralize(b.adults, 'adult')}${b.children ? `, ${pluralize(b.children, 'child', 'children')}` : ''}`], ['Meal plan', b.mealPlan?.toUpperCase()], ['Guest', b.guestName], ['Email', b.guestEmail], ['Phone', b.guestPhone], ...(b.specialRequests ? [['Requests', b.specialRequests]] : [])]
              .map(([k, v]) => <div key={k} className="flex justify-between gap-6"><dt className="text-cream/50">{k}</dt><dd className="break-words text-right text-cream">{v}</dd></div>)}
          </dl>
        </div>
        <div className="glass rounded-[2rem] p-6 sm:p-8">
          <h2 className="font-display text-3xl">Price</h2>
          <div className="mt-3"><PriceBreakdown q={{ nights: b.nights, pricePerNight: b.pricePerNight, roomAmount: b.roomAmount, mealAmount: b.mealAmount, discountAmount: b.discountAmount, promoCode: b.promoCode, total: b.totalAmount, baseAmount: b.baseAmount, gstRate: b.gstRate, gstAmount: b.gstAmount, extrasTotal: b.extrasTotal }} /></div>
          <div className="mt-5 space-y-1 border-t border-white/10 pt-4 text-sm">
            <div className="flex justify-between"><span className="text-cream/50">Payment status</span><span className="capitalize text-cream">{b.paymentStatus}</span></div>
            {(b.paidAmount || 0) > 0 && <div className="flex justify-between"><span className="text-cream/50">Paid</span><span>{formatINR(b.paidAmount)}</span></div>}
            {b.status !== 'cancelled' && <div className="flex justify-between"><span className="text-cream/50">Balance due at resort</span><span className="text-gold-light">{formatINR(balance)}</span></div>}
          </div>
          {b.payments && b.payments.length > 0 && (
            <div className="mt-4"><p className="text-[0.7rem] uppercase tracking-[0.2em] text-gold">Payments</p>
              <ul className="mt-2 space-y-1 text-xs text-cream/70">{b.payments.map((p, i) => <li key={p._id || i} className="flex justify-between"><span>{formatDateTime(p.at)} · {statusLabel(p.method)}</span><span>{formatINR(p.amount)}</span></li>)}</ul></div>
          )}
          {b.extras && b.extras.length > 0 && (
            <div className="mt-4"><p className="text-[0.7rem] uppercase tracking-[0.2em] text-gold">Extras</p>
              <ul className="mt-2 space-y-1 text-xs text-cream/70">{b.extras.map((x, i) => <li key={x._id || i} className="flex justify-between"><span>{x.description}</span><span>{formatINR(x.amount)}</span></li>)}</ul></div>
          )}
        </div>
      </div>
    </div>
  );
}

