'use client';

import { Activity, ArrowLeft, Box, Building2, Eye, Radio, Tags } from 'lucide-react';
import Link from 'next/link';
import { SidebarLink } from './sidebar-link';
import type { NavItem } from './types';

export function AppMenu({ appId, isOpen }: { appId: string; isOpen: boolean }) {
  const navItems: NavItem[] = [
    { label: 'Overview', href: `/applications/${appId}`, icon: Eye },
    { label: 'Events', href: `/applications/${appId}/events`, icon: Activity },
    { label: 'Event Types', href: `/applications/${appId}/event-types`, icon: Tags },
    { label: 'Endpoints', href: `/applications/${appId}/endpoints`, icon: Radio },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <div className={`${isOpen ? 'px-3' : 'px-2'} mb-2`}>
        <Link
          href="/applications"
          className={`flex items-center rounded-xl text-sm font-medium transition-all duration-200 text-text-muted
            ${isOpen ? 'gap-2 px-3 py-2' : 'w-10 h-10 justify-center'}`}
        >
          <ArrowLeft size={18} />
          {isOpen && 'Back to applications'}
        </Link>
      </div>

      <div className={`${isOpen ? 'px-5 mb-4' : 'px-2 mb-2'}`}>
        <div
          className={`flex items-center ${isOpen ? 'gap-2.5' : 'w-10 h-10 justify-center rounded-xl'}`}
        >
          <div className="p-1.5 rounded-lg bg-input text-primary">
            <Building2 size={18} />
          </div>
          {isOpen && <span className="font-semibold text-sm text-text-main truncate">{appId}</span>}
        </div>
      </div>

      <nav className={`flex-1 space-y-1 ${isOpen ? 'px-3' : 'px-2'}`}>
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
    </div>
  );
}
