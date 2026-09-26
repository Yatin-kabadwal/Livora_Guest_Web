import { Suspense } from 'react';
import { ResetForm } from '@/components/auth/AuthForms';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta('Reset password', 'Reset password to your Corbett The Vedant By Livora guest account.', '/auth/reset-password', { noindex: true });
export default function Page() { return <Suspense fallback={<div className="min-h-screen" />}><ResetForm /></Suspense>; }
