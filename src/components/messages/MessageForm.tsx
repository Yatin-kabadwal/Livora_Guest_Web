'use client';
import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '@/lib/api';
import { isEmail, isPhone, cn } from '@/lib/format';
import { saveThread } from '@/lib/storage';
import { useAuth } from '@/store/auth';
import { Field } from '@/components/ui/Field';

export const TOPICS = [
  { value: 'general', label: 'General enquiry' },
  { value: 'booking', label: 'Booking' },
  { value: 'event', label: 'Events & groups' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'complaint', label: 'Complaint' },
  { value: 'other', label: 'Other' },
];

export function AnimatedCheck({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <motion.circle cx="36" cy="36" r="32" stroke="#d9b76a" strokeWidth="2.5" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.7 }} />
      <motion.path d="M22 37 L32 47 L51 26" stroke="#f0d9a0" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.55 }} />
    </svg>
  );
}


interface Props { compact?: boolean; defaultTopic?: string; defaultSubject?: string; defaultMessage?: string; onSent?: () => void }

export function MessageForm({ compact, defaultTopic = 'general', defaultSubject = '', defaultMessage = '', onSent }: Props) {
  const user = useAuth((s) => s.user);
  const [f, setF] = useState({ name: '', email: '', phone: '', topic: defaultTopic, subject: defaultSubject, message: defaultMessage, website: '' });
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<{ ref: string; token: string } | null>(null);

  useEffect(() => { setF((s) => ({ ...s, topic: defaultTopic, subject: defaultSubject || s.subject, message: defaultMessage || s.message })); }, [defaultTopic, defaultSubject, defaultMessage]);
  useEffect(() => {
    if (user) setF((s) => ({ ...s, name: s.name || [user.firstName, user.lastName].filter(Boolean).join(' '), email: s.email || user.email, phone: s.phone || user.phone || '' }));
  }, [user]);

  const sfx = compact ? 'c' : 'f';
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.name.trim().length < 2) er.name = 'Please tell us your name';
    if (!isEmail(f.email)) er.email = 'Please enter a valid email';
    if (f.phone && !isPhone(f.phone)) er.phone = 'Please enter a valid phone number';
    if (f.message.trim().length < 5) er.message = 'Please write a short message';
    setErr(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    try {
      const { data } = await api.post<{ ref: string; token: string; message: string }>('/messages', {
        name: f.name.trim(), email: f.email.trim(), phone: f.phone.trim() || undefined, topic: f.topic,
        subject: f.subject.trim() || undefined, message: f.message.trim(), source: 'website', website: f.website,
      });
      if (!data?.token) throw new Error('The server sent an unexpected reply. Please try again.');
      saveThread({ ref: data.ref, token: data.token, subject: f.subject.trim() || f.topic, at: new Date().toISOString() });
      setSent({ ref: data.ref, token: data.token });
      onSent?.();
    } catch (x) {
      toast.error(apiError(x));
    } finally { setBusy(false); }
  };

  return (
    <AnimatePresence mode="wait">
      {sent ? (
        <motion.div key="ok" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-8 text-center" role="status">
          <AnimatedCheck />
          <h3 className="mt-6 font-display text-3xl text-cream">Message sent</h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-cream/70">Thank you. Our team will reply here and by email. Your reference is <span className="font-semibold text-gold-light">{sent.ref}</span>.</p>
          <Link href={`/messages/${sent.token}`} className="btn btn-gold btn-sm mt-6">View conversation</Link>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={submit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4" aria-label="Send us a message">
          <div className={cn('grid gap-4', !compact && 'sm:grid-cols-2')}>
            <Field id={`mf-name-${sfx}`} label="Your name" auto="name" value={f.name} onChange={set('name')} error={err.name} />
            <Field id={`mf-email-${sfx}`} label="Email" type="email" auto="email" value={f.email} onChange={set('email')} error={err.email} />
          </div>
          <div className={cn('grid gap-4', !compact && 'sm:grid-cols-2')}>
            <Field id={`mf-phone-${sfx}`} label="Phone (optional)" type="tel" auto="tel" value={f.phone} onChange={set('phone')} error={err.phone} />
            <div className="field">
              <select id={`mf-topic-${compact ? 'c' : 'f'}`} value={f.topic} onChange={set('topic')}>
                {TOPICS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <label htmlFor={`mf-topic-${compact ? 'c' : 'f'}`}>Topic</label>
            </div>
          </div>
          {!compact && <Field id={`mf-subject-${sfx}`} label="Subject (optional)" value={f.subject} onChange={set('subject')} />}
          <div className={cn('field', err.message && 'invalid')}>
            <textarea id={`mf-msg-${compact ? 'c' : 'f'}`} value={f.message} onChange={set('message')} placeholder=" " rows={compact ? 4 : 6} aria-invalid={!!err.message} />
            <label htmlFor={`mf-msg-${compact ? 'c' : 'f'}`}>How can we help?</label>
            {err.message && <p className="field-error">{err.message}</p>}
          </div>
          {/* honeypot: real visitors never see or fill this */}
          <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
            <label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} /></label>
          </div>
          <button type="submit" disabled={busy} className="btn btn-gold w-full">
            {busy ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-forest-950 border-t-transparent" /> : <Send size={16} />} {busy ? 'Sending' : 'Send message'}
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
