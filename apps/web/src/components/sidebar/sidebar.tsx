'use client';

import { Settings, Webhook } from 'lucide-react';
import Link from 'next/link';
import { useSidebar } from '../../contexts/sidebar-context';
import { AppMenu } from './app-menu';
import { MainMenu } from './main-menu';
import { SidebarLink } from './sidebar-link';
import { ToggleSideBar } from './toggle-sidebar';

const bottomItems = [{ label: 'Settings', href: '/dashboard/settings', icon: Settings }];

type SidebarProps = { variant: 'main' } | { variant: 'application'; appId: string };

export function Sidebar(props: SidebarProps) {
  const { isOpen, toggle: toggleSideBar } = useSidebar();

  return (
    <>
    <aside className={`fixed md:static z-50 h-full flex transition-[width] duration-200 flex-col ${isOpen ? 'w-[260px] bg-surface md:bg-transparent inset-0' : 'w-[60px] hidden md:flex'}`}>
      <div
        className={`flex py-4 px-3 pb-8 ${isOpen ? 'justify-between items-center' : 'flex-col items-center gap-4'}`}
      >
        <div>
          <Link tabIndex={-1} href="/dashboard" className="flex items-center gap-2.5 select-none">
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

        <ToggleSideBar />
      </div>

      <nav aria-label="Sidebar" className="flex-1 flex flex-col">
        {props.variant === 'main' ? (
          <MainMenu isOpen={isOpen} />
        ) : (
          <AppMenu appId={props.appId} isOpen={isOpen} />
        )}

        <ul className={`pb-4 space-y-1 pt-4 mt-2 ${isOpen ? 'px-3' : 'px-2'}`}>
          {bottomItems.map((item) => (
            <SidebarLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isOpen={isOpen}
            />
          ))}
        </ul>
      </nav>
    </aside>

    {isOpen && (
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-200 md:hidden"
        onClick={toggleSideBar}
      />
    )}
    </>
  );
}
