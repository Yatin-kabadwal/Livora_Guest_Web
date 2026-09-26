'use client';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="grid min-h-[100svh] place-items-center px-6 text-center">
      <div>
        <p className="eyebrow">Something went wrong</p>
        <h1 className="h-display mt-4 text-6xl sm:text-8xl">A <em className="text-gold-light">stumble</em> on the trail</h1>
        <p className="mx-auto mt-5 max-w-md text-cream/65">We hit an unexpected problem. Please try again, and if it keeps happening, call us and we will help directly.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3"><button onClick={reset} className="btn btn-gold">Try again</button><Link href="/" className="btn btn-ghost">Back to home</Link></div>
      </div>
    </div>
  );
}
