'use client';

import { Activity, Building2, Eye, Radio, StepBack, Tags } from 'lucide-react';
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
      <ul className={`${isOpen ? 'px-3' : 'px-2'} mb-2`}>
        <SidebarLink
          href="/applications"
          label={'Back to applications'}
          icon={StepBack}
          isOpen={isOpen}
        />
      </ul>

      <div className={`${isOpen ? 'px-3 mb-8' : 'px-2 mb-6'}`}>
        <div
          className={`flex items-center ${isOpen ? 'gap-2.5' : 'w-10 h-10 justify-center rounded-xl'}`}
          title={appId}
        >
          <div className="px-3 py-1.5 rounded-lg bg-input text-primary">
            <Building2 size={18} />
          </div>
          {isOpen && <span className="font-semibold text-sm text-text-main truncate">{appId}</span>}
        </div>
      </div>

      <ul className={`flex-1 space-y-1 ${isOpen ? 'px-3' : 'px-2'}`}>
        {navItems.map((item) => (
          <SidebarLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            isOpen={isOpen}
          />
        ))}
      </ul>
    </div>
  );
}
