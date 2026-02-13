'use client';

import { createContext, useContext, useState } from 'react';

type SidebarContextType = {
  isOpen: boolean;
  toggle: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({
  children,
  defaultOpen,
}: {
  children: React.ReactNode;
  defaultOpen: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    document.cookie = `sidebar-open=${newState.toString()}; path=/; max-age=360000`;
  };

  return <SidebarContext.Provider value={{ isOpen, toggle }}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a sidebarProvider');
  }
  return context;
}
