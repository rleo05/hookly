import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';
import { cookies } from 'next/headers';
import { ThemeProvider } from '../components/theme-provider';
import { SidebarProvider } from '../contexts/sidebar-context';

const fontSans = Space_Grotesk({
  variable: '--font-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Hookly',
  description: 'Manage, route, and monitor your webhooks with ease.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar-open')?.value === 'true';

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} font-sans antialiased`}>
        <SidebarProvider defaultOpen={defaultOpen}>
          <ThemeProvider>{children}</ThemeProvider>
        </SidebarProvider>
      </body>
    </html>
  );
}
