'use client';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/format';

export function PasswordField({ id, label, value, onChange, error, auto = 'current-password' }: { id: string; label: string; value: string; onChange: (e: { target: { value: string } }) => void; error?: string; auto?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className={cn('field', error && 'invalid')}>
      <input id={id} type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder=" " autoComplete={auto} aria-invalid={!!error} className="pr-12" />
      <label htmlFor={id}>{label}</label>
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-cream/50 transition hover:text-gold">{show ? <EyeOff size={17} /> : <Eye size={17} />}</button>
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  );
}
