'use client';
import { Utensils } from 'lucide-react';
import { formatINR, cn } from '@/lib/format';
import type { MealPlan } from '@/types';

export function MealPlanSelector({ plans, value, onChange }: { plans: MealPlan[]; value: string; onChange: (code: string) => void }) {
  return (
    <fieldset>
      <legend className="mb-3 flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.2em] text-gold"><Utensils size={14} /> Meal plan</legend>
      <div className="grid gap-2">
        {plans.map((p) => (
          <label key={p.code} className={cn('flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition', value === p.code ? 'border-gold bg-gold/10' : 'border-white/12 hover:border-white/30')}>
            <input type="radio" name="mealPlan" value={p.code} checked={value === p.code} onChange={() => onChange(p.code)} className="mt-1 accent-[#d9b76a]" />
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-3 text-sm font-semibold text-cream">{p.label}<span className="whitespace-nowrap text-xs font-medium text-gold-light">{p.adultPrice > 0 ? `+${formatINR(p.adultPrice)} / adult / night` : 'Included'}</span></span>
              {p.description && <span className="mt-0.5 block text-xs text-cream/55">{p.description}{p.childPrice > 0 ? ` · Child ${formatINR(p.childPrice)}` : ''}</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
