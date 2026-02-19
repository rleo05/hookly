import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Header } from '../header';
import { Sidebar } from '../sidebar/sidebar';

export async function ApplicationLayoutContent({
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

  if (!res.ok || res.status !== 200) {
    redirect('/applications');
  }

  return (
    <div className="flex h-screen p-3 gap-2">
      <Sidebar variant="application" appId={appId} />
      <div className="flex-1 flex flex-col bg-surface h-full border border-border rounded-2xl">
        <Header />
        <main className="overflow-auto py-4 px-8">{children}</main>
      </div>
    </div>
  );
}
