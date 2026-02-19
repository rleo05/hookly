import { Suspense } from 'react';
import { ApplicationLayoutContent } from '@/src/components/applications/application-layout-content';
import { Loader } from '@/src/components/loader';

export default function ApplicationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ appId: string }>;
}) {
  return (
    <Suspense fallback={<Loader text="Loading application..." fullScreen={true} />}>
      <ApplicationLayoutContent params={params}>{children}</ApplicationLayoutContent>
    </Suspense>
  );
}
