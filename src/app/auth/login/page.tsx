import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/AuthForms';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta('Sign in', 'Sign in to your Corbett The Vedant By Livora guest account.', '/auth/login', { noindex: true });
export default function Page() { return <Suspense fallback={<div className="min-h-screen" />}><LoginForm /></Suspense>; }
