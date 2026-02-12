import { Sidebar } from '../../../../components/sidebar/sidebar';
import { Header } from '../../../../components/header';

export default async function ApplicationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ appId: string }>;
}) {
  const { appId } = await params;

  return (
    <>
      <Sidebar variant="application" appId={appId} />
      <main className="ml-[260px] px-8">
        <Header/>
        {children}
      </main>
    </>
  );
}
