import { auth } from '@hookly/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { SessionProvider } from '@/src/contexts/session-context';

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/auth/sign-in');
  }

  return (
    <SessionProvider session={session}>
      <div className="bg-background">{children}</div>
    </SessionProvider>
  );
}
