import { cn } from '@/lib/format';

/** Floating-label input. Defined at module level so it never remounts while typing. */
export function Field({ id, label, value, onChange, error, type = 'text', auto, required, maxLength, hint }: {
  id: string; label: string; value: string; onChange: (e: { target: { value: string } }) => void; error?: string; type?: string; auto?: string; required?: boolean; maxLength?: number; hint?: string;
}) {
  return (
    <div className={cn('field', error && 'invalid')}>
      <input id={id} type={type} value={value} onChange={onChange} placeholder=" " autoComplete={auto} required={required} maxLength={maxLength}
        aria-invalid={!!error} aria-describedby={error ? `${id}-e` : hint ? `${id}-h` : undefined} />
      <label htmlFor={id}>{label}</label>
      {error ? <p id={`${id}-e`} className="field-error" role="alert">{error}</p> : hint ? <p id={`${id}-h`} className="mt-1 text-xs text-cream/45">{hint}</p> : null}
    </div>
  );
}

export function TextArea({ id, label, value, onChange, error, rows = 4, maxLength }: { id: string; label: string; value: string; onChange: (e: { target: { value: string } }) => void; error?: string; rows?: number; maxLength?: number }) {
  return (
    <div className={cn('field', error && 'invalid')}>
      <textarea id={id} value={value} onChange={onChange} placeholder=" " rows={rows} maxLength={maxLength} aria-invalid={!!error} />
      <label htmlFor={id}>{label}</label>
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  );
}
