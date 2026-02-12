'use client';

import { PanelLeft, Settings, Webhook } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { AppMenu } from './app-menu';
import { MainMenu } from './main-menu';
import { SidebarLink } from './sidebar-link';

const bottomItems = [{ label: 'Settings', href: '/dashboard/settings', icon: Settings }];

type SidebarProps = 
  | { variant: 'main' } 
  | { variant: 'application'; appId: string };

export function Sidebar(props: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSideBar = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <aside
      className={`h-full bg-surface flex flex-col ${isOpen ? 'w-[260px]' : 'w-[60px]'} overflow-hidden border-r border-border`}
    >
      <div
        className={`flex p-6 pb-8 ${isOpen ? 'justify-between items-center' : 'flex-col items-center gap-4'}`}
      >
        <div>
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-[0_4px_12px_rgba(124,58,237,0.25)]">
              <Webhook size={18} strokeWidth={2.5} />
            </div>
            <span
              className={`font-bold text-lg tracking-tight text-text-main ${isOpen ? '' : 'hidden'}`}
            >
              Hookly
            </span>
          </Link>
        </div>

        <button
          type="button"
          className="p-2 rounded-xl cursor-pointer transition-all duration-200 text-text-muted"
          onClick={toggleSideBar}
        >
          <PanelLeft size={20} />
        </button>
      </div>

      {props.variant === 'main' ? (
        <MainMenu isOpen={isOpen} />
      ) : (
        <AppMenu appId={props.appId} isOpen={isOpen} />
      )}

      <div className={`pb-4 space-y-1 pt-4 mt-2 ${isOpen ? 'px-3' : 'px-2'}`}>
        {bottomItems.map((item) => (
          <SidebarLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            isOpen={isOpen}
          />
        ))}
      </div>
    </aside>
  );
}
