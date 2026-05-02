import * as React from 'react';
import { cn } from '@/lib/cn';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
};

const VARIANTS: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-[color:var(--color-evolt-orange)] text-black active:opacity-80',
  secondary:
    'bg-[color:var(--color-evolt-surface)] text-white active:opacity-80',
  ghost:
    'bg-transparent text-white active:bg-[color:var(--color-evolt-surface)]',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = 'primary', fullWidth, className, type = 'button', children, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center rounded-2xl px-5 text-base font-medium tap-target',
          'transition-opacity disabled:opacity-50 disabled:cursor-not-allowed',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-evolt-orange)]',
          fullWidth && 'w-full',
          VARIANTS[variant],
          className,
        )}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
