'use client';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError, apiStatus, getWithRetry } from '@/lib/api';
import { formatDateTime, statusLabel, cn } from '@/lib/format';
import type { Thread, ThreadMessage } from '@/types';
import { Skeleton } from '@/components/ui/Skeleton';

const STATUS_STYLE: Record<string, string> = {
  new: 'border-ember/60 text-ember bg-ember/10',
  open: 'border-sage/60 text-sage bg-sage/10',
  resolved: 'border-gold/60 text-gold-light bg-gold/10',
};

export function ThreadStatusChip({ status }: { status: string }) {
  return <span className={cn('chip', STATUS_STYLE[status] || '')}>{statusLabel(status)}</span>;
}

const firstName = (n?: string) => (n ? n.split(' ')[0] : 'Team');

export function ThreadView({ token, compact = false, onMissing }: { token: string; compact?: boolean; onMissing?: () => void }) {
  const [thread, setThread] = useState<Thread | null>(null);
  const [shown, setShown] = useState<ThreadMessage[]>([]);
  const [state, setState] = useState<'loading' | 'ok' | 'missing' | 'error'>('loading');
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const shownCount = useRef(0);
  const first = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const apply = useCallback((t: Thread) => {
    setThread(t);
    const msgs = t.messages || [];
    const newStaff = !first.current && msgs.length > shownCount.current && msgs.slice(shownCount.current).some((m) => m.sender === 'staff');
    first.current = false;
    if (newStaff) {
      setTyping(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => { setTyping(false); setShown(msgs); shownCount.current = msgs.length; }, 1100);
    } else { setShown((cur) => { const pend = cur.filter((m) => m.pending); return pend.length ? [...msgs, ...pend] : msgs; }); shownCount.current = msgs.length; }
  }, []);

  const load = useCallback(async (initial = false) => {
    try {
      const t = initial ? await getWithRetry<Thread>(`/messages/thread/${token}`, undefined, 3) : (await api.get<Thread>(`/messages/thread/${token}`)).data;
      if (!t || typeof t !== 'object' || !Array.isArray(t.messages)) throw new Error('bad');
      apply(t); setState('ok');
    } catch (e) {
      const s = apiStatus(e);
      if (s === 404 || s === 400) { setState('missing'); onMissing?.(); }
      else if (initial) setState('error');
    }
  }, [token, apply, onMissing]);

  useEffect(() => { first.current = true; shownCount.current = 0; load(true); return () => clearTimeout(timer.current); }, [load]);
  useEffect(() => {
    let id: ReturnType<typeof setInterval> | undefined;
    const start = () => { if (!id) id = setInterval(() => { if (!document.hidden) load(); }, 10000); };
    const stop = () => { if (id) { clearInterval(id); id = undefined; } };
    const vis = () => { if (document.hidden) stop(); else { load(); start(); } };
    start(); document.addEventListener('visibilitychange', vis);
    return () => { stop(); document.removeEventListener('visibilitychange', vis); };
  }, [load]);

  useEffect(() => { const el = box.current; if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }); }, [shown.length, typing]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    const opt: ThreadMessage = { sender: 'guest', body, at: new Date().toISOString(), pending: true, _id: 'p' + Date.now() };
    setShown((s) => [...s, opt]); setText(''); setSending(true);
    try {
      await api.post(`/messages/thread/${token}/reply`, { message: body });
      await load();
    } catch (x) {
      toast.error(apiError(x));
      setShown((s) => s.filter((m) => m !== opt));
      setText(body);
    } finally { setSending(false); }
  };

  if (state === 'loading') return (
    <div className="space-y-4 p-4" aria-busy="true"><Skeleton className="h-16 w-2/3" /><Skeleton className="ml-auto h-12 w-1/2" /><Skeleton className="h-20 w-3/4" /></div>
  );
  if (state === 'missing') return (
    <div className="p-8 text-center"><p className="font-display text-3xl text-cream">Conversation not found</p><p className="mt-2 text-sm text-cream/60">This link may be incomplete or the conversation is no longer available. You can always send us a new message.</p></div>
  );
  if (state === 'error' || !thread) return (
    <div className="p-8 text-center"><p className="font-display text-2xl text-cream">We could not load this conversation</p><button className="btn btn-ghost btn-sm mt-4" onClick={() => { setState('loading'); load(true); }}>Try again</button></div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="min-w-0"><p className="truncate font-display text-xl text-cream">{thread.subject || 'Your conversation'}</p><p className="text-xs text-cream/50">{thread.ref}</p></div>
        <ThreadStatusChip status={thread.status} />
      </div>
      <div ref={box} data-lenis-prevent className={cn('flex-1 space-y-3 overflow-y-auto px-4 py-4', compact ? 'min-h-[14rem]' : 'min-h-[22rem]')} role="log" aria-live="polite" aria-label="Conversation">
        <AnimatePresence initial={false}>
          {shown.map((m, i) => {
            const mine = m.sender === 'guest';
            return (
              <motion.div key={m._id || i} layout initial={{ opacity: 0, y: 14, scale: 0.97 }} animate={{ opacity: m.pending ? 0.6 : 1, y: 0, scale: 1 }} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed', mine ? 'rounded-br-md bg-gradient-to-br from-gold-light to-gold text-forest-950' : 'rounded-bl-md border border-white/10 bg-white/[0.07] text-cream')}>
                  {!mine && <p className="mb-0.5 text-[0.7rem] font-semibold uppercase tracking-wider text-gold">{firstName(m.staffName)}</p>}
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p className={cn('mt-1 text-[0.68rem]', mine ? 'text-forest-800/70' : 'text-cream/40')}>{m.pending ? 'Sending' : formatDateTime(m.at)}</p>
                </div>
              </motion.div>
            );
          })}
          {typing && (
            <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-start" aria-label="Team is typing">
              <div className="flex gap-1.5 rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.07] px-4 py-3">
                {[0, 1, 2].map((d) => <motion.span key={d} className="h-1.5 w-1.5 rounded-full bg-gold" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: d * 0.15 }} />)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {shown.length === 0 && <p className="py-6 text-center text-sm text-cream/50">No messages yet.</p>}
      </div>
      <form onSubmit={send} className="flex items-end gap-2 border-t border-white/10 p-3">
        <label htmlFor={`reply-${compact ? 'c' : 'f'}`} className="sr-only">Your reply</label>
        <textarea id={`reply-${compact ? 'c' : 'f'}`} value={text} onChange={(e) => setText(e.target.value)} rows={1} placeholder="Write a reply" maxLength={2000}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); (e.currentTarget.form as HTMLFormElement).requestSubmit(); } }}
          className="max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl border border-white/15 bg-white/[0.05] px-4 py-3 text-sm text-cream outline-none transition placeholder:text-cream/40 focus:border-gold" />
        <button type="submit" disabled={!text.trim() || sending} aria-label="Send reply" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold text-forest-950 transition hover:shadow-glow disabled:opacity-40"><Send size={17} /></button>
      </form>
    </div>
  );
}
