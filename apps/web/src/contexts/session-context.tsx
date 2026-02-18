'use client';

import { createContext, useContext } from 'react';

export interface SessionContextType {
  session: {
    id: string;
  };
  user: {
    email: string;
    name: string;
    image?: string | null;
  };
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: SessionContextType;
}) {
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a sessionProvider');
  }
  return context;
}
