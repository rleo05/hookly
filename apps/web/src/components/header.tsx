'use client';

import { Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { getBreadcrumbs } from '@/src/utils/breadcrumbs';
import { ThemeToggle } from './theme-toggle';
import { UserButton } from '@/src/components/user-button'

export function Header() {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <header className="flex items-center justify-between py-2 pr-2 border-b border-border">
      {breadcrumbs}
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="relative p-2 rounded-xl cursor-pointer transition-all duration-200 text-text-muted"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--input)';
            e.currentTarget.style.color = 'var(--primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_rgba(124,58,237,0.4)]" />
        </button>

        <ThemeToggle />

        <div className="w-px h-6 mx-2 bg-border" />

        <UserButton/>
      </div>
    </header>
  );
}
