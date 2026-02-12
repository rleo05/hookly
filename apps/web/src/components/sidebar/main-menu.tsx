'use client';

import { Box, KeyRound, LayoutDashboard } from 'lucide-react';
import { SidebarLink } from './sidebar-link';
import type { NavItem } from './types';

export function MainMenu({ isOpen }: { isOpen: boolean }) {
  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Applications', href: '/applications', icon: Box },
    { label: 'API Keys', href: '/keys', icon: KeyRound },
  ];

  return (
    <nav className={`flex-1 space-y-1 ${isOpen ? 'px-3' : 'px-2 items-center'}`}>
      {navItems.map((item) => (
        <SidebarLink
          key={item.href}
          href={item.href}
          label={item.label}
          icon={item.icon}
          isOpen={isOpen}
        />
      ))}
    </nav>
  );
}
