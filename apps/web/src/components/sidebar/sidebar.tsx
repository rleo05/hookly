'use client';

import { LogOut, Settings, Webhook } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppMenu } from './app-menu';
import { MainMenu } from './main-menu';

const bottomItems = [{ label: 'Settings', href: '/dashboard/settings', icon: Settings }];

type SidebarProps = { variant: 'main' } | { variant: 'application'; appId: string };

export function Sidebar(props: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[260px] bg-surface flex flex-col z-50"
      style={{
        borderRight: '1px solid var(--border)',
      }}
    >
      <div className="p-6 pb-8">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div
            className="p-2 rounded-xl"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
            }}
          >
            <Webhook size={20} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg tracking-tight text-text-main">Hookly</span>
        </Link>
      </div>

      {props.variant === 'main' ? <MainMenu /> : <AppMenu appId={props.appId} />}

      <div className="px-3 pb-4 space-y-1 border-t border-border pt-4 mt-2">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? 'var(--primary-foreground)' : 'var(--text-muted)',
              }}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
        <button
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
