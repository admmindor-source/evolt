'use client';

import { useActionState, useOptimistic, startTransition } from 'react';
import { logHydrationAction, type LogHydrationState } from '@/app/evolucao/actions';

type HydrationTrackerProps = {
  goalLiters: number;
  totalMl: number;
  todayDate: string;
};

const QUICK_ADD = [250, 500, 750] as const;

export function HydrationTracker({ goalLiters, totalMl, todayDate }: HydrationTrackerProps) {
  const goalMl = goalLiters * 1000;
  const [optimisticMl, addOptimistic] = useOptimistic(totalMl, (prev, added: number) => prev + added);
  const [, formAction] = useActionState<LogHydrationState | null, FormData>(logHydrationAction, null);

  const pct = Math.min(100, (optimisticMl / goalMl) * 100);
  const consumed = (optimisticMl / 1000).toFixed(1);
  const goal = goalLiters.toFixed(1);

  function quickAdd(ml: number) {
    startTransition(() => {
      addOptimistic(ml);
      const fd = new FormData();
      fd.set('ml_added', String(ml));
      fd.set('log_date', todayDate);
      formAction(fd);
    });
  }

  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--color-evolt-surface)' }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span style={{ color: 'var(--color-evolt-muted)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
          </span>
          <p className="text-sm font-semibold text-white">Hidratação</p>
        </div>
        <p className="text-sm font-bold text-white">
          <span style={{ color: pct >= 100 ? '#4ade80' : 'var(--color-evolt-orange)' }}>{consumed}</span>
          <span style={{ color: 'var(--color-evolt-muted)' }}> / {goal} L</span>
        </p>
      </div>

      <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: pct >= 100 ? '#4ade80' : 'var(--color-evolt-orange)',
          }}
        />
      </div>

      <div className="flex gap-2">
        {QUICK_ADD.map((ml) => (
          <button
            key={ml}
            type="button"
            onClick={() => quickAdd(ml)}
            disabled={optimisticMl >= goalMl}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-opacity disabled:opacity-40"
            style={{ background: 'rgba(255,120,20,0.12)', color: 'var(--color-evolt-orange)' }}
          >
            +{ml}ml
          </button>
        ))}
      </div>

      {pct >= 100 && (
        <p className="text-xs text-center mt-2" style={{ color: '#4ade80' }}>
          Meta atingida!
        </p>
      )}
    </div>
  );
}
