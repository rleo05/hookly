import type { DashboardResponse } from '@hookly/api-types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getDashboardData(
  startDate: string,
  endDate: string,
): Promise<DashboardResponse> {
  const url = new URL(`${BASE_URL}/app/dashboard`);
  url.searchParams.set('startDate', startDate);
  url.searchParams.set('endDate', endDate);

  const res = await fetch(url.toString(), {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch dashboard: ${res.statusText}`);
  }

  return res.json();
}
