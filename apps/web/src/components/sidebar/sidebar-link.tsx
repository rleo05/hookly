'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarLinkProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  isOpen: boolean;
}

export function SidebarLink({ href, label, icon: Icon, isOpen }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <li>
      <Link
        href={href}
        className={`relative flex items-center rounded-lg text-sm font-medium transition-all duration-200 group
          ${isOpen ? 'gap-3 px-3 py-2' : 'w-10 h-10 justify-center'} 
          ${isActive ? 'bg-primary text-primary-foreground shadow-[0_4px_12px_rgba(124,58,237,0.2)]' : 'bg-transparent text-text-muted hover:bg-hover-bg hover:text-hover-text'}
        `}
      >
        <Icon size={18} />
        {isOpen && label}

        {!isOpen && (
          <div className="absolute left-full ml-3 rounded-md px-2.5 py-1 bg-text-main text-surface text-xs font-medium shadow-lg invisible opacity-0 group-hover:translate-x-1 transition-all group-hover:visible group-hover:opacity-100 whitespace-nowrap tooltip-arrow">
            {label}
          </div>
        )}
      </Link>
    </li>
  );
}
