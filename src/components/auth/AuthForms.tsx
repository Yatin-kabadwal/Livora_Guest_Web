'use client';
import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { AuthShell } from './AuthShell';
import { PasswordField } from './PasswordField';
import { Field } from '@/components/ui/Field';
import { AnimatedCheck } from '@/components/messages/MessageForm';
import { api, apiError } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { safeNext } from '@/lib/nav';
import { isEmail, isPhone } from '@/lib/format';
import type { AuthResponse } from '@/types';

const Submit = ({ busy, children }: { busy: boolean; children: string }) => (
  <button type="submit" disabled={busy} className="btn btn-gold w-full">{busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-forest-950 border-t-transparent" />}{children}</button>
);

function useRedirectIfAuthed() {
  const router = useRouter();
  const sp = useSearchParams();
  const { hydrated, user } = useAuth();
  useEffect(() => { if (hydrated && user) router.replace(safeNext(sp.get('next'))); }, [hydrated, user, router, sp]);
}

export function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const setSession = useAuth((s) => s.setSession);
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  useRedirectIfAuthed();
  const next = sp.get('next');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!isEmail(f.email)) er.email = 'Please enter a valid email';
    if (!f.password) er.password = 'Please enter your password';
    setErr(er); if (Object.keys(er).length) return;
    setBusy(true);
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', { email: f.email.trim(), password: f.password, area: 'guest' });
      setSession({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user });
      toast.success(`Welcome back, ${data.user.firstName}`);
      router.replace(safeNext(next));
    } catch (x) { toast.error(apiError(x)); } finally { setBusy(false); }
  };
  return (
    <AuthShell title="Welcome back" sub="Sign in to see your bookings and messages." footer={<>New here? <Link className="text-gold underline" href={`/auth/register${next ? `?next=${encodeURIComponent(next)}` : ''}`}>Create an account</Link></>}>
      <form onSubmit={submit} noValidate className="space-y-4" aria-label="Sign in">
        <Field id="l-email" label="Email" type="email" auto="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} error={err.email} />
        <PasswordField id="l-pw" label="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} error={err.password} />
        <div className="text-right"><Link href="/auth/forgot-password" className="text-xs text-gold hover:underline">Forgot password?</Link></div>
        <Submit busy={busy}>{busy ? 'Signing in' : 'Sign in'}</Submit>
      </form>
    </AuthShell>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const setSession = useAuth((s) => s.setSession);
  const [f, setF] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirm: '' });
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  useRedirectIfAuthed();
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.firstName.trim().length < 2) er.firstName = 'Please enter your first name';
    if (!isEmail(f.email)) er.email = 'Please enter a valid email';
    if (!isPhone(f.phone)) er.phone = 'Please enter a valid phone number';
    if (f.password.length < 8) er.password = 'Use at least 8 characters';
    if (f.confirm !== f.password) er.confirm = 'Passwords do not match';
    setErr(er); if (Object.keys(er).length) return;
    setBusy(true);
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', { firstName: f.firstName.trim(), lastName: f.lastName.trim() || undefined, email: f.email.trim(), phone: f.phone.trim(), password: f.password });
      setSession({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user });
      toast.success('Your account is ready');
      router.replace(safeNext(sp.get('next')));
    } catch (x) { toast.error(apiError(x)); } finally { setBusy(false); }
  };
  return (
    <AuthShell title="Create account" sub="Book faster and keep all your stays and messages in one place." footer={<>Already have an account? <Link className="text-gold underline" href="/auth/login">Sign in</Link></>}>
      <form onSubmit={submit} noValidate className="space-y-4" aria-label="Create account">
        <div className="grid gap-4 sm:grid-cols-2"><Field id="r-fn" label="First name" auto="given-name" value={f.firstName} onChange={set('firstName')} error={err.firstName} /><Field id="r-ln" label="Last name" auto="family-name" value={f.lastName} onChange={set('lastName')} /></div>
        <Field id="r-em" label="Email" type="email" auto="email" value={f.email} onChange={set('email')} error={err.email} />
        <Field id="r-ph" label="Phone" type="tel" auto="tel" value={f.phone} onChange={set('phone')} error={err.phone} />
        <PasswordField id="r-pw" label="Password (8+ characters)" auto="new-password" value={f.password} onChange={set('password')} error={err.password} />
        <PasswordField id="r-cf" label="Confirm password" auto="new-password" value={f.confirm} onChange={set('confirm')} error={err.confirm} />
        <Submit busy={busy}>{busy ? 'Creating account' : 'Create account'}</Submit>
        <p className="text-center text-xs text-cream/45">By continuing you agree to our <Link href="/terms" className="underline">terms</Link> and <Link href="/privacy" className="underline">privacy policy</Link>.</p>
      </form>
    </AuthShell>
  );
}

export function ForgotForm() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isEmail(email)) { setErr('Please enter a valid email'); return; }
    setErr(''); setBusy(true);
    try { await api.post('/auth/forgot-password', { email: email.trim(), area: 'guest' }); setDone(true); }
    catch (x) { toast.error(apiError(x)); } finally { setBusy(false); }
  };
  return (
    <AuthShell title="Forgot password" sub="Enter your email and we will send you a reset link." footer={<Link className="text-gold underline" href="/auth/login">Back to sign in</Link>}>
      {done ? (
        <div className="flex flex-col items-center text-center" role="status"><AnimatedCheck /><p className="mt-5 font-display text-3xl">Check your inbox</p><p className="mt-2 text-sm text-cream/65">If an account exists for {email}, a reset link is on its way. It can take a minute to arrive.</p></div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4"><Field id="f-em" label="Email" type="email" auto="email" value={email} onChange={(e) => setEmail(e.target.value)} error={err} /><Submit busy={busy}>{busy ? 'Sending' : 'Send reset link'}</Submit></form>
      )}
    </AuthShell>
  );
}

export function ResetForm() {
  const sp = useSearchParams();
  const router = useRouter();
  const token = sp.get('token') || '';
  const [f, setF] = useState({ password: '', confirm: '' });
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.password.length < 8) er.password = 'Use at least 8 characters';
    if (f.confirm !== f.password) er.confirm = 'Passwords do not match';
    setErr(er); if (Object.keys(er).length) return;
    setBusy(true);
    try { await api.post('/auth/reset-password', { token, password: f.password }); setDone(true); setTimeout(() => router.replace('/auth/login'), 2500); }
    catch (x) { toast.error(apiError(x)); } finally { setBusy(false); }
  };
  return (
    <AuthShell title="New password" sub="Choose a new password for your account." footer={<Link className="text-gold underline" href="/auth/login">Back to sign in</Link>}>
      {!token ? <p role="alert" className="rounded-xl bg-ember/10 p-4 text-sm text-ember">This reset link is incomplete. Please use the link from your email, or <Link href="/auth/forgot-password" className="underline">request a new one</Link>.</p>
        : done ? <div className="flex flex-col items-center text-center" role="status"><AnimatedCheck /><p className="mt-5 font-display text-3xl">Password updated</p><p className="mt-2 text-sm text-cream/65">Taking you to sign in.</p></div>
        : <form onSubmit={submit} noValidate className="space-y-4"><PasswordField id="n-pw" label="New password" auto="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} error={err.password} /><PasswordField id="n-cf" label="Confirm password" auto="new-password" value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} error={err.confirm} /><Submit busy={busy}>{busy ? 'Saving' : 'Update password'}</Submit></form>}
    </AuthShell>
  );
}
