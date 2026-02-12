import { Sidebar } from '../../../components/sidebar/sidebar';
import { Header } from '../../../components/header';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar variant="main" />
      <main className="ml-[260px] px-8">
        <Header/>
        {children}
      </main>
    </>
  );
}
