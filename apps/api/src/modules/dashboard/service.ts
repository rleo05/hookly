import { Prisma, prisma } from '@hookly/database';
import type {
  DailyVolumeItem,
  DashboardMetrics,
  DashboardResponse,
  FailureReasonItem,
  RecentActivityItem,
} from './schema.js';

export async function getDashboardData(
  userId: string,
  startDate: string,
  endDate: string,
): Promise<DashboardResponse> {
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T23:59:59.999Z`);

  const [metrics, dailyVolume, failureReasons, recentActivity] = await Promise.all([
    getMetrics(userId, start, end),
    getDailyVolume(userId, start, end),
    getFailureReasons(userId, start, end),
    getRecentActivity(userId, 8),
  ]);

  return { metrics, dailyVolume, failureReasons, recentActivity };
}

async function getMetrics(userId: string, start: Date, end: Date): Promise<DashboardMetrics> {
  const dateAndUserFilter = {
    createdAt: { gte: start, lte: end },
    event: {
      application: {
        userId,
        deletedAt: null,
      },
    },
  };

  const [deliveredResult, failedResult, latencyResult] = await Promise.all([
    prisma.eventAttempt.count({
      where: {
        status: 'COMPLETED',
        ...dateAndUserFilter,
      },
    }),
    prisma.eventAttempt.count({
      where: {
        status: 'FAILED',
        ...dateAndUserFilter,
      },
    }),
    prisma.eventAttempt.aggregate({
      _avg: { durationMs: true },
      where: {
        status: 'COMPLETED',
        durationMs: { not: null },
        ...dateAndUserFilter,
      },
    }),
  ]);

  const totalDelivered = deliveredResult;
  const totalFailed = failedResult;
  const total = totalDelivered + totalFailed;
  const successRate = total > 0 ? ((totalDelivered / total) * 100).toFixed(1) : '—';
  const avgLatencyMs = latencyResult._avg?.durationMs
    ? Math.round(latencyResult._avg.durationMs)
    : null;

  return { totalDelivered, totalFailed, successRate, avgLatencyMs };
}

async function getDailyVolume(userId: string, start: Date, end: Date): Promise<DailyVolumeItem[]> {
  const rows = await prisma.$queryRaw<
    Array<{ day: Date; delivered: bigint; failed: bigint }>
  >(Prisma.sql`
    SELECT
      DATE_TRUNC('day', ea.created_at) AS day,
      COUNT(*) FILTER (WHERE ea.status = 'COMPLETED') AS delivered,
      COUNT(*) FILTER (WHERE ea.status = 'FAILED') AS failed
    FROM event_attempts ea
    JOIN events e ON e.id = ea.event_id
    JOIN applications a ON a.id = e.application_id
    WHERE a.user_id = ${userId}
      AND a.deleted_at IS NULL
      AND ea.created_at >= ${start}
      AND ea.created_at <= ${end}
    GROUP BY day
    ORDER BY day ASC
  `);

  return rows.map((r) => ({
    date: r.day.toISOString().slice(0, 10),
    delivered: Number(r.delivered),
    failed: Number(r.failed),
  }));
}

const FAILURE_CATEGORIES: Array<{
  name: string;
  code: string;
  color: string;
  description: string;
  match: (responseCode: number | null) => boolean;
}> = [
  {
    name: 'Timeout / Network',
    code: 'timeout',
    color: '#f87171',
    description: 'Destination server down or took > 5s',
    match: (code) => code === null,
  },
  {
    name: '500+ Server Error',
    code: '5xx',
    color: '#fb923c',
    description: "Client's server broke receiving the payload",
    match: (code) => code !== null && code >= 500,
  },
  {
    name: '401 / 403 Auth',
    code: 'auth',
    color: '#a78bfa',
    description: 'Auth token expired or missing',
    match: (code) => code !== null && (code === 401 || code === 403),
  },
  {
    name: '404 Not Found',
    code: '404',
    color: '#60a5fa',
    description: 'Webhook URL changed and not updated',
    match: (code) => code !== null && code === 404,
  },
  {
    name: '429 Too Many Requests',
    code: '429',
    color: '#22C55E',
    description: 'Client exceeded rate limit',
    match: (code) => code !== null && code === 429,
  },
];

async function getFailureReasons(
  userId: string,
  start: Date,
  end: Date,
): Promise<FailureReasonItem[]> {
  const failedAttempts = await prisma.eventAttempt.findMany({
    where: {
      status: 'FAILED',
      createdAt: { gte: start, lte: end },
      event: {
        application: {
          userId,
          deletedAt: null,
        },
      },
    },
    select: { responseCode: true },
  });

  if (failedAttempts.length === 0) return [];

  const counts: Record<string, number> = {};
  for (const cat of FAILURE_CATEGORIES) {
    counts[cat.code] = 0;
  }
  counts['other'] = 0;

  for (const attempt of failedAttempts) {
    let matched = false;
    for (const cat of FAILURE_CATEGORIES) {
      if (cat.match(attempt.responseCode)) {
        counts[cat.code]++;
        matched = true;
        break;
      }
    }
    if (!matched) {
      counts['other']++;
    }
  }

  const total = failedAttempts.length;
  const results: FailureReasonItem[] = [];

  for (const cat of FAILURE_CATEGORIES) {
    if (counts[cat.code] > 0) {
      results.push({
        name: cat.name,
        code: cat.code,
        value: Math.round((counts[cat.code] / total) * 100),
        count: counts[cat.code],
        color: cat.color,
        description: cat.description,
      });
    }
  }

  if (counts['other'] > 0) {
    results.push({
      name: 'Other',
      code: 'other',
      value: Math.round((counts['other'] / total) * 100),
      count: counts['other'],
      color: '#94a3b8',
      description: 'Other HTTP error codes',
    });
  }

  return results;
}

async function getRecentActivity(userId: string, limit: number): Promise<RecentActivityItem[]> {
  const attempts = await prisma.eventAttempt.findMany({
    where: {
      event: {
        application: {
          userId,
          deletedAt: null,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      status: true,
      createdAt: true,
      attemptNumber: true,
      event: {
        select: {
          uid: true,
          eventType: true,
          application: {
            select: { name: true },
          },
        },
      },
      endpoint: {
        select: { url: true },
      },
    },
  });

  return attempts.map((a) => ({
    eventUid: a.event.uid,
    appName: a.event.application.name,
    eventType: a.event.eventType,
    status: a.status,
    endpointUrl: a.endpoint.url,
    attemptNumber: a.attemptNumber,
    createdAt: a.createdAt,
  }));
}
