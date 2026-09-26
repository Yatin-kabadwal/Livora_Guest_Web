'use client';
import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Field, TextArea } from '@/components/ui/Field';
import { AnimatedCheck } from '@/components/messages/MessageForm';
import { api, apiError } from '@/lib/api';
import { isEmail, cn } from '@/lib/format';

const LABELS = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

export function ReviewView() {
  const sp = useSearchParams();
  const [f, setF] = useState({ ref: sp.get('ref') || '', email: sp.get('email') || '', title: '', comment: '', location: '' });
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!f.ref.trim() || !isEmail(f.email)) return toast.error('Please enter your booking reference and email');
    if (!rating) return toast.error('Please choose a star rating');
    if (f.comment.trim().length < 10) return toast.error('Please write at least 10 characters');
    setBusy(true);
    try {
      await api.post('/reviews', { ref: f.ref.trim().toUpperCase(), email: f.email.trim(), rating, title: f.title.trim() || undefined, comment: f.comment.trim(), location: f.location.trim() || undefined });
      setDone(true);
    } catch (x) { toast.error(apiError(x)); } finally { setBusy(false); }
  };

  return (
    <div className="container-x pb-24 pt-36 sm:pt-44">
      <div className="mx-auto max-w-2xl">
        <p className="eyebrow mb-4">Share your stay</p>
        <h1 className="h-display text-5xl sm:text-7xl">Write a <em className="text-gold-light">review</em></h1>
        {done ? (
          <div className="glass mt-10 flex flex-col items-center rounded-[2rem] p-12 text-center" role="status"><AnimatedCheck /><h2 className="mt-6 font-display text-4xl">Thank you</h2><p className="mt-2 text-cream/65">Your review has been received. It will appear on the website once our team has approved it.</p><Link href="/" className="btn btn-gold btn-sm mt-6">Back to home</Link></div>
        ) : (
          <form onSubmit={submit} noValidate className="glass mt-10 space-y-5 rounded-[2rem] p-6 sm:p-9">
            <p className="text-sm text-cream/60">Reviews can be written by guests who have completed their stay.</p>
            <div className="grid gap-4 sm:grid-cols-2"><Field id="r-ref" label="Booking reference" value={f.ref} onChange={(e) => setF({ ...f, ref: e.target.value.toUpperCase() })} /><Field id="r-email" label="Email used to book" type="email" value={f.email} onChange={set('email')} auto="email" /></div>
            <div><p id="rate-l" className="mb-2 text-[0.7rem] uppercase tracking-[0.2em] text-gold">Your rating</p>
              <div role="radiogroup" aria-labelledby="rate-l" className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <motion.button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? 's' : ''}, ${LABELS[n - 1]}`} whileTap={{ scale: 0.8 }} whileHover={{ scale: 1.15 }} onMouseEnter={() => setHover(n)} onClick={() => setRating(n)} className="p-1">
                    <Star size={36} className={cn('transition', (hover || rating) >= n ? 'fill-gold text-gold drop-shadow-[0_0_8px_rgba(217,183,106,.6)]' : 'text-cream/30')} />
                  </motion.button>
                ))}
                <span className="ml-3 text-sm text-cream/60" aria-live="polite">{LABELS[(hover || rating) - 1] || ''}</span>
              </div></div>
            <Field id="r-title" label="Title (optional)" value={f.title} onChange={set('title')} maxLength={80} />
            <TextArea id="r-comment" label="Your experience" value={f.comment} onChange={set('comment')} rows={5} maxLength={1500} />
            <Field id="r-loc" label="Where are you from? (optional)" value={f.location} onChange={set('location')} maxLength={60} />
            <button type="submit" disabled={busy} className="btn btn-gold w-full">{busy ? 'Submitting' : 'Submit review'}</button>
          </form>
        )}
      </div>
    </div>
  );
}
