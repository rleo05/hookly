import { Header } from '../../../components/header';
import { Sidebar } from '../../../components/sidebar/sidebar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen p-3 gap-2">
      <Sidebar variant="main" />
      <div className="flex-1 flex flex-col bg-surface h-full border border-border rounded-2xl">
        <Header />
        <main className="overflow-auto py-4 px-8">{children}</main>
      </div>
    </div>
  );
}
