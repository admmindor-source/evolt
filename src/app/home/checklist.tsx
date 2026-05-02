'use client';

import { useTransition } from 'react';
import { toggleChecklistItem } from './actions';
import type { Category } from '@/lib/routine/templates';

type ChecklistItemProps = {
  category: Category;
  label: string;
  subtitle: string;
  completed: boolean;
  todayDate: string;
};

function CategoryIcon({ category }: { category: Category }) {
  if (category === 'supplement') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.5 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v3" />
        <circle cx="18" cy="18" r="3" /><path d="M15.7 15.7 20.3 20.3" />
      </svg>
    );
  }
  if (category === 'workout') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 6.5h11" /><path d="M6.5 17.5h11" />
        <path d="M3 9.5h2.5v5H3z" /><path d="M18.5 9.5H21v5h-2.5z" />
        <path d="M5.5 9.5V14.5" /><path d="M18.5 9.5V14.5" />
        <rect x="5.5" y="9" width="13" height="6" rx="1" />
      </svg>
    );
  }
  if (category === 'nutrition') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
      </svg>
    );
  }
  if (category === 'hydration') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>
    );
  }
  return null;
}

export function ChecklistItem({ category, label, subtitle, completed, todayDate }: ChecklistItemProps) {
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
      className="flex items-center gap-3 w-full text-left py-3 active:opacity-70 disabled:opacity-50"
    >
      {/* Icon */}
      <span
        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
        style={{
          background: isChecked ? 'var(--color-evolt-orange)' : 'rgba(255,255,255,0.06)',
          color: isChecked ? 'black' : 'var(--color-evolt-orange)',
        }}
        aria-hidden
      >
        <CategoryIcon category={category} />
      </span>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={['text-sm font-medium leading-tight', isChecked ? 'line-through opacity-50' : 'text-white'].join(' ')}>
          {label}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-evolt-muted)' }}>
          {subtitle}
        </p>
      </div>

      {/* Checkbox */}
      <span
        className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
        style={{
          background: isChecked ? 'var(--color-evolt-orange)' : 'transparent',
          borderColor: isChecked ? 'var(--color-evolt-orange)' : 'rgba(255,255,255,0.25)',
        }}
        aria-hidden
      >
        {isChecked && (
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
            <path d="M1 5L4.5 8.5L11 1.5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </button>
  );
}
