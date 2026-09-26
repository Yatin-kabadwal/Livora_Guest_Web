import { Suspense } from 'react';
import { ForgotForm } from '@/components/auth/AuthForms';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta('Forgot password', 'Forgot password to your Corbett The Vedant By Livora guest account.', '/auth/forgot-password', { noindex: true });
export default function Page() { return <Suspense fallback={<div className="min-h-screen" />}><ForgotForm /></Suspense>; }
