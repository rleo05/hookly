import { Header } from '../../../components/header';
import { Sidebar } from '../../../components/sidebar/sidebar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar variant="main" />
      <main className="flex-1 overflow-auto px-8">
        <Header />
        {children}
      </main>
    </div>
  );
}
