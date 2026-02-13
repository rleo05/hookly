import { Header } from '../../../components/header';
import { Sidebar } from '../../../components/sidebar/sidebar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen px-2 py-3 gap-2">
      <Sidebar variant="main" />
      <main className="flex-1 overflow-auto px-8 bg-surface border border-border rounded-2xl">
        <Header />
        {children}
      </main>
    </div>
  );
}
