import { Suspense } from 'react';
import { RegisterForm } from '@/components/auth/AuthForms';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta('Create account', 'Create account to your Corbett The Vedant By Livora guest account.', '/auth/register', { noindex: true });
export default function Page() { return <Suspense fallback={<div className="min-h-screen" />}><RegisterForm /></Suspense>; }
