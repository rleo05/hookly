'use client';

import { LogOut, User, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { useSession } from '@/src/contexts/session-context';
import { authClient } from '@/src/lib/auth-client';

export function UserCard() {
  const { user } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await authClient.signOut();
    router.replace('/auth/sign-in');
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="outline-none" asChild>
        <div className="flex items-center gap-2.5 py-1.5 px-2 rounded-xl cursor-pointer transition-all duration-200 hover:bg-input">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              user.name.charAt(0).toUpperCase() +
              (user.name.split(' ').length > 1
                ? user.name.split(' ')[1].charAt(0).toUpperCase()
                : '')
            )}
          </div>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-sm font-medium text-text-main">{user.name}</span>
            <span className="text-xs text-text-muted max-w-[18ch] truncate">{user.email}</span>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-60 p-2 border-none bg-surface shadow-2xl dark:shadow-black/40 rounded-xl"
      >
        <div className="flex flex-col items-center justify-center p-1 gap-2">
          <div className="w-full flex justify-end">
            <X
              size={18}
              className="text-text-muted hover:text-primary transition-colors cursor-pointer"
              onClick={() => setIsOpen(false)}
            />
          </div>
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold bg-primary text-primary-foreground overflow-hidden">
            {user.image ? (
              <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user.name.charAt(0).toUpperCase() +
              (user.name.split(' ').length > 1
                ? user.name.split(' ')[1].charAt(0).toUpperCase()
                : '')
            )}
          </div>
          <div className="flex flex-col items-center text-center w-full">
            <span className="font-semibold text-lg text-text-main">{user.name}</span>
            <span className="text-sm text-text-muted truncate max-w-full px-2">{user.email}</span>
          </div>
        </div>
        <DropdownMenuItem className="cursor-pointer mt-6 py-2.5">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600 cursor-pointer py-2.5"
          onSelect={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
