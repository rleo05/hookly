'use client';

import { format, startOfMonth } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardPanel } from '@/src/components/dashboard/dashboard-panel';

function getDefaultDates() {
  const now = new Date();
  return {
    start: format(startOfMonth(now), 'yyyy-MM-dd'),
    end: format(now, 'yyyy-MM-dd'),
  };
}

export default function Dashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const defaults = getDefaultDates();

  const startDate = searchParams.get('startDate') ?? defaults.start;
  const endDate = searchParams.get('endDate') ?? defaults.end;

  const isDefault = startDate === defaults.start && endDate === defaults.end;

  const updateUrl = (start: string, end: string) => {
    const params = new URLSearchParams();
    params.set('startDate', start);
    params.set('endDate', end);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleStartChange = (v: string) => updateUrl(v, endDate);
  const handleEndChange = (v: string) => updateUrl(startDate, v);
  const handleReset = () => router.replace('?', { scroll: false });

  return (
    <DashboardPanel
      startDate={startDate}
      endDate={endDate}
      onStartChange={handleStartChange}
      onEndChange={handleEndChange}
      onReset={isDefault ? undefined : handleReset}
    />
  );
}
