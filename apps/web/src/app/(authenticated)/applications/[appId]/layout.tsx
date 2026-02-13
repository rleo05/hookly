import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Header } from '../../../../components/header';
import { Sidebar } from '../../../../components/sidebar/sidebar';

export default async function ApplicationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ appId: string }>;
}) {
  const { appId } = await params;
  const headersList = await headers();

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/application/${appId}`, {
    cache: 'no-store',
    headers: {
      Cookie: headersList.get('cookie') || '',
    },
  });

  if (!res.ok) {
    //sonner
  }

  if (res.status !== 200) {
    redirect('/applications');
  }

  const application = await res.json();

  return (
    <div className="flex h-screen p-2 gap-2">
      <Sidebar variant="application" appId={appId} />
      <main className="flex-1 overflow-auto px-8 bg-surface border border-border rounded-2xl">
        <Header />
        {children}
      </main>
    </div>
  );
}
