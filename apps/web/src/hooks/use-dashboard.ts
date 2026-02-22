import { useQuery } from '@tanstack/react-query';
import { getDashboardData } from '@/src/services/api/dashboard';

export function useDashboard(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['dashboard', startDate, endDate],
    queryFn: () => getDashboardData(startDate, endDate),
  });
}
