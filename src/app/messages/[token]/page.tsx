import type { Metadata } from 'next';
import Link from 'next/link';
import { ThreadView } from '@/components/messages/ThreadView';

export const metadata: Metadata = { title: 'Your conversation', robots: { index: false, follow: false } };

export default function ConversationPage({ params }: { params: { token: string } }) {
  return (
    <div className="container-x pb-20 pt-32 sm:pt-40">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow mb-3">Messages</p>
        <h1 className="h-display text-5xl sm:text-6xl">Your <em className="text-gold-light">conversation</em></h1>
        <p className="mt-3 text-sm text-cream/55">Keep this page bookmarked. Replies from our team appear here and are also emailed to you.</p>
        <div className="glass mt-8 flex h-[70svh] min-h-[28rem] flex-col overflow-hidden rounded-[2rem]"><ThreadView token={params.token} /></div>
        <p className="mt-6 text-center text-sm text-cream/50"><Link href="/contact" className="text-gold underline">Start a new message</Link></p>
      </div>
    </div>
  );
}
