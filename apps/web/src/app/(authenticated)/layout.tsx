import { auth } from '@hookly/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect('/auth/sign-in');
  }

  return <div className="min-h-screen bg-background">{children}</div>;
}
