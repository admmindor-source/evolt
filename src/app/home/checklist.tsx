'use client';

import { useTransition } from 'react';
import { toggleChecklistItem } from './actions';
import type { Category } from '@/lib/routine/templates';

type ChecklistItemProps = {
  category: Category;
  label: string;
  completed: boolean;
  todayDate: string;
};

export function ChecklistItem({ category, label, completed, todayDate }: ChecklistItemProps) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(() => {
      toggleChecklistItem(category, completed, todayDate);
    });
  }

  const isChecked = isPending ? !completed : completed;

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={isChecked ? `Desmarcar ${label}` : `Marcar ${label} como concluído`}
      className="tap-target flex items-center gap-3 w-full text-left active:opacity-70 disabled:opacity-50"
    >
      <span
        className={[
          'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
          isChecked
            ? 'bg-[color:var(--color-evolt-orange)] border-[color:var(--color-evolt-orange)]'
            : 'border-white/30 bg-transparent',
        ].join(' ')}
        aria-hidden
      >
        {isChecked && (
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden>
            <path d="M1 5L4.5 8.5L11 1.5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className={['text-sm font-medium', isChecked ? 'line-through text-[color:var(--color-evolt-muted)]' : 'text-white'].join(' ')}>
        {label}
      </span>
    </button>
  );
}
