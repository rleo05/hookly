'use client';

import {
  Activity,
  Box,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Radio,
  Settings,
  Webhook,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Applications', href: '/dashboard/applications', icon: Box },
  { label: 'Endpoints', href: '/dashboard/endpoints', icon: Radio },
  { label: 'Events', href: '/dashboard/events', icon: Activity },
  { label: 'Event Types', href: '/dashboard/event-types', icon: Activity },
  { label: 'API Keys', href: '/dashboard/api-keys', icon: KeyRound },
];

const bottomItems = [{ label: 'Settings', href: '/dashboard/settings', icon: Settings }];

export function Sidebar() {
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

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? 'var(--primary-foreground)' : 'var(--text-muted)',
                boxShadow: isActive ? '0 4px 12px rgba(124, 58, 237, 0.2)' : 'none',
              }}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

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
