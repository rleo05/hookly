'use client';

import { Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { UserCard } from '@/src/components/user-card';
import { getBreadcrumbs } from '@/src/utils/breadcrumbs';
import { ToggleSideBar } from './sidebar/toggle-sidebar';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between md:py-1 md:pr-2 md:border-b md:border-border">
      <div className="pl-4 pr-2 py-1 flex items-center justify-between border-b border-border md:contents md:p-0 md:border-0">
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

      <div className="py-2.5 pl-6 pr-2 md:bg-transparent md:pl-8 md:py-0 md:pr-0">
        {breadcrumbs}
      </div>
    </header>
  );
}
