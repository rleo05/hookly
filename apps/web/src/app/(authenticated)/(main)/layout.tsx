import { Header } from '../../../components/header';
import { Sidebar } from '../../../components/sidebar/sidebar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden md:p-3 gap-2">
      <Sidebar variant="main" />
      <div className="flex-1 min-w-0 flex flex-col bg-surface h-full border border-border md:rounded-2xl">
        <Header />
        <main className="flex-1 min-h-0 overflow-auto py-4 px-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
