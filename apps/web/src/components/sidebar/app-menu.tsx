'use client';

import { Activity, ArrowLeft, Box, Eye, Radio, Tags } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem } from './types';

export function AppMenu({ appId }: { appId: string }) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { label: 'Overview', href: `/applications/${appId}`, icon: Eye },
    { label: 'Events', href: `/applications/${appId}/events`, icon: Activity },
    { label: 'Event Types', href: `/applications/${appId}/event-types`, icon: Tags },
    { label: 'Endpoints', href: `/applications/${appId}/endpoints`, icon: Radio },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-3 mb-2">
        <Link
          href="/applications"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={16} />
          Back to applications
        </Link>
      </div>

      <div className="px-5 mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="p-1.5 rounded-lg"
            style={{
              backgroundColor: 'var(--input)',
              color: 'var(--primary)',
            }}
          >
            <Box size={16} />
          </div>
          <span className="font-semibold text-sm text-text-main truncate">{appId}</span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === `/applications/${appId}`
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200"
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
    </div>
  );
}
