'use client';

import { Bell } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  return (
    <header className="flex items-center justify-end py-2">
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="relative p-2 rounded-xl cursor-pointer transition-all duration-200 text-text-muted"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--input)';
            e.currentTarget.style.color = 'var(--primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_rgba(124,58,237,0.4)]" />
        </button>

        <ThemeToggle />

        <div className="w-px h-6 mx-2 bg-border" />

        <button
          type="button"
          className="flex items-center gap-2.5 py-1.5 px-2 rounded-xl cursor-pointer transition-all duration-200"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--input)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              color: 'var(--primary-foreground)',
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.2)',
            }}
          >
            U
          </div>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-sm font-medium text-text-main">User</span>
            <span className="text-xs text-text-muted">user@hookly.io</span>
          </div>
        </button>
      </div>
    </header>
  );
}
