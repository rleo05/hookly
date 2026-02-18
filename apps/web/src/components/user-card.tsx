'use client';

import { useSession } from '@/src/contexts/session-context';

export function UserCard() {
  const { user } = useSession();
  return (
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
          color: 'var(--primary-foreground)',
        }}
      >
        {user.image ? (
          <img src={user.image} alt={user.name} width={32} height={32} className="rounded-full" />
        ) : (
          user.name.charAt(0).toUpperCase() +
          (user.name.split(' ').length > 1 ? user.name.split(' ')[1].charAt(0).toUpperCase() : '')
        )}
      </div>
      <div className="hidden sm:flex flex-col items-start">
        <span className="text-sm font-medium text-text-main">{user.name}</span>
        <span className="text-xs text-text-muted">{user.email}</span>
      </div>
    </button>
  );
}
