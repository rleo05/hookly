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

  return (
    <div className="flex h-screen">
      <Sidebar variant="application" appId={appId} />
      <main className="flex-1 overflow-auto px-8">
        <Header />
        {children}
      </main>
    </div>
  );
}
