'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { setTheme } = useTheme();

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      className="p-2 rounded-xl cursor-pointer transition-all duration-200 text-text-muted bg-transparent"
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--input)';
        e.currentTarget.style.color = 'var(--primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = 'var(--text-muted)';
      }}
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={`Switch theme`}
    >
      <Sun className="hidden dark:block" size={18} />
      <Moon className="block dark:hidden" size={18} />
    </button>
  );
}
