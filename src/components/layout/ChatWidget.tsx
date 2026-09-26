'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, X, Plus, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { MessageForm } from '@/components/messages/MessageForm';
import { ThreadView } from '@/components/messages/ThreadView';
import { getSavedThreads, type SavedThread } from '@/lib/storage';
import { useSettings } from '@/hooks/useSettings';
import { waLink } from '@/config/site';
import { cn } from '@/lib/format';

/** Floating chat (bottom-right) + a separate subtle WhatsApp button stacked above it. */
export function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [threads, setThreads] = useState<SavedThread[]>([]);
  const [composing, setComposing] = useState(false);
  const [prefill, setPrefill] = useState<{ topic?: string; subject?: string; message?: string } | null>(null);
  const { settings } = useSettings();
  const [past, setPast] = useState(false);
  useEffect(() => { const on = () => setPast(window.scrollY > 300); on(); window.addEventListener('scroll', on, { passive: true }); return () => window.removeEventListener('scroll', on); }, []);
  const hideOnHero = pathname === '/' && !past && !open; // keeps the mobile hero search bar clear

  useEffect(() => {
    const load = () => setThreads(getSavedThreads());
    load();
    window.addEventListener('cvl-threads', load);
    window.addEventListener('storage', load);
    const openEv = (e: Event) => { const d = (e as CustomEvent).detail; if (d) { setPrefill(d); setComposing(true); } setOpen(true); };
    window.addEventListener('cvl-open-chat', openEv);
    return () => { window.removeEventListener('cvl-threads', load); window.removeEventListener('storage', load); window.removeEventListener('cvl-open-chat', openEv); };
  }, []);
  useEffect(() => { if (!open) { setComposing(false); setPrefill(null); } }, [open]);

  if (pathname.startsWith('/messages') || pathname.startsWith('/auth')) return null;
  const current = threads[0];
  const showThread = current && !composing;

  return (
    <>
      <a href={waLink(settings.whatsapp, 'Hello, I would like to know more about Corbett The Vedant By Livora.')} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp"
        className={`fixed bottom-[9.5rem] right-4 z-[55] grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-forest-900/80 text-[#5ad07f] shadow-glass backdrop-blur transition duration-500 hover:scale-110 hover:border-[#5ad07f]/60 md:bottom-[5.75rem] md:right-6 ${hideOnHero ? 'max-md:pointer-events-none max-md:opacity-0' : ''}`}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12.04 2a9.9 9.9 0 0 0-8.47 15.02L2 22l5.1-1.34A9.9 9.9 0 1 0 12.04 2Zm0 18.1c-1.5 0-2.97-.4-4.25-1.16l-.3-.18-3.03.8.81-2.95-.2-.31a8.1 8.1 0 1 1 6.97 3.8Zm4.45-6.06c-.24-.12-1.44-.71-1.66-.79-.22-.08-.38-.12-.54.12-.16.24-.62.79-.76.95-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.5.58.18 1.1.16 1.51.1.46-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z" /></svg>
      </a>
      <button onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close chat' : 'Message us'} aria-expanded={open}
        className={`fixed bottom-[5.25rem] right-4 z-[56] grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-gold-light to-gold text-forest-950 shadow-glow transition duration-500 hover:scale-105 md:bottom-6 md:right-6 ${hideOnHero ? 'max-md:pointer-events-none max-md:opacity-0' : ''}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={open ? 'x' : 'm'} initial={{ rotate: -80, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 80, opacity: 0 }} transition={{ duration: 0.2 }}>
            {open ? <X size={22} /> : <MessageCircle size={22} />}
          </motion.span>
        </AnimatePresence>
        {!open && <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-gold/30" style={{ animationDuration: '3s' }} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.section role="dialog" aria-label="Message us" initial={{ opacity: 0, y: 30, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.96 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="glass-solid fixed bottom-[9.25rem] right-4 z-[57] flex max-h-[min(34rem,calc(100svh-11rem))] w-[min(24rem,calc(100vw-2rem))] origin-bottom-right flex-col overflow-hidden rounded-3xl shadow-glass md:bottom-24 md:right-6">
            <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-forest-800 to-forest-900 px-5 py-4">
              <div><p className="font-display text-2xl leading-none text-cream">Message us</p><p className="mt-1 text-xs text-sage">We usually reply within a few hours</p></div>
              {current && (
                <button onClick={() => setComposing((c) => !c)} className={cn('chip', composing ? 'chip-gold' : '')} aria-label={composing ? 'Back to conversation' : 'Start a new message'}>
                  {composing ? 'Conversation' : <><Plus size={12} /> New</>}
                </button>
              )}
            </div>
            <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto">
              {showThread ? (
                <div className="flex h-[26rem] max-h-full flex-col">
                  <ThreadView key={current.token} token={current.token} compact onMissing={() => setComposing(true)} />
                  <Link href={`/messages/${current.token}`} className="flex items-center justify-center gap-2 border-t border-white/10 py-2 text-xs text-cream/50 transition hover:text-gold">Open full conversation <ExternalLink size={12} /></Link>
                </div>
              ) : (
                <div className="p-5"><MessageForm compact defaultTopic={prefill?.topic} defaultSubject={prefill?.subject} defaultMessage={prefill?.message} onSent={() => { setComposing(false); setPrefill(null); }} /></div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
