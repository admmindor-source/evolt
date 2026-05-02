import * as React from 'react';
import { cn } from '@/lib/cn';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, error, hint, className, id, ...rest }, ref) {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-white">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(
            'tap-target rounded-2xl bg-[color:var(--color-evolt-surface)] px-4 text-base text-white',
            // 16px font prevents iOS zoom on focus
            'placeholder:text-[color:var(--color-evolt-muted)]',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-evolt-orange)]',
            error ? 'outline outline-2 outline-red-500' : '',
            className,
          )}
          {...rest}
        />
        {error ? (
          <p id={`${inputId}-error`} className="text-xs text-red-400">{error}</p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-xs text-[color:var(--color-evolt-muted)]">{hint}</p>
        ) : null}
      </div>
    );
  },
);
