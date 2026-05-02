'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = { href: string; label: string };

const NAV_ITEMS: NavItem[] = [
  { href: '/home', label: 'Hoje' },
  { href: '/evolucao', label: 'Evolução' },
  { href: '/loja', label: 'Loja' },
  { href: '/perfil', label: 'Perfil' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[color:var(--color-evolt-surface)] border-t border-white/10 z-50">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {NAV_ITEMS.map(({ href, label }) => {
          const active = pathname === href || (href !== '/home' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={[
                'tap-target flex flex-col items-center gap-0.5 text-xs font-medium px-4',
                active
                  ? 'text-[color:var(--color-evolt-orange)]'
                  : 'text-[color:var(--color-evolt-muted)]',
              ].join(' ')}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
