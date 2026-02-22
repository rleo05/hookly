'use client';

import { Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { UserCard } from '@/src/components/user-card';
import { getBreadcrumbs } from '@/src/utils/breadcrumbs';
import { ThemeToggle } from './theme-toggle';
import { ToggleSideBar } from './sidebar/toggle-sidebar';

export function Header() {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between py-2 pr-2 border-b border-border">
      <div className="pl-4 flex items-center justify-between md:contents">
        <ToggleSideBar className="md:hidden" />

        <div className="flex items-center gap-1 md:order-last">
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

          <UserCard />
        </div>
      </div>

      <div className="mt-1 pl-6 md:pl-8 md:mt-0">
        {breadcrumbs}
      </div>
    </header>
  );
}
