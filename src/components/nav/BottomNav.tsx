'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

function IconHome({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.15 : 0} />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconCalendar({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.12 : 0} />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconChart({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function IconPerson({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.12 : 0} />
      <circle cx="12" cy="7" r="4" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.12 : 0} />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: '/home', label: 'Início', Icon: IconHome },
  { href: '/rotina', label: 'Rotina', Icon: IconCalendar },
  null, // FAB placeholder
  { href: '/evolucao', label: 'Evolução', Icon: IconChart },
  { href: '/perfil', label: 'Perfil', Icon: IconPerson },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div
        className="relative flex items-end justify-around max-w-lg mx-auto px-2"
        style={{ backgroundColor: 'var(--color-evolt-surface)', borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        {NAV_ITEMS.map((item, i) => {
          if (!item) {
            return (
              <Link
                key="fab"
                href="/evolucao"
                className="flex-shrink-0 -mt-5 mb-2"
                aria-label="Registrar progresso"
              >
                <span
                  className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg"
                  style={{ background: 'var(--color-evolt-orange)' }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>
              </Link>
            );
          }

          const { href, label, Icon } = item;
          const active = pathname === href || (href !== '/home' && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className="tap-target flex flex-col items-center gap-0.5 pt-2 pb-3 px-2"
              style={{ color: active ? 'var(--color-evolt-orange)' : 'var(--color-evolt-muted)' }}
            >
              <Icon active={active} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
