'use client';

import { Box, KeyRound, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem } from './types';

export function MainMenu() {
  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Applications', href: '/applications', icon: Box },
    { label: 'API Keys', href: '/keys', icon: KeyRound },
  ];

  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
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
  );
}
