import * as React from 'react';
import { cn } from '@/lib/cn';

export function Card({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-[color:var(--color-evolt-surface)] p-5 shadow-sm',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
