import { z } from 'zod';

export const dashboardQuerySchema = z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;

export interface DashboardMetrics {
    totalDelivered: number;
    totalFailed: number;
    successRate: string;
    avgLatencyMs: number | null;
}

export interface DailyVolumeItem {
    date: string;
    delivered: number;
    failed: number;
}

export interface FailureReasonItem {
    name: string;
    code: string;
    value: number;
    count: number;
    color: string;
    description: string;
}

export interface RecentActivityItem {
    eventUid: string;
    appName: string;
    eventType: string;
    status: string;
    endpointUrl: string;
    attemptNumber: number;
    createdAt: Date;
}

export interface DashboardResponse {
    metrics: DashboardMetrics;
    dailyVolume: DailyVolumeItem[];
    failureReasons: FailureReasonItem[];
    recentActivity: RecentActivityItem[];
}
