import type { DashboardResponse } from '@hookly/api-types';
import { format, parseISO } from 'date-fns';
import { AlertTriangle, CheckCircle2, XCircle, Zap } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatRelativeTime } from '@/src/utils/dates';

export function MetricCard({
  label,
  value,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col gap-3 ${
        accent ? 'bg-primary border-primary/30 text-primary-foreground' : 'bg-surface border-border'
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-sm font-medium ${accent ? 'text-primary-foreground/70' : 'text-text-muted'}`}
        >
          {label}
        </span>
        <div className={`p-2 rounded-xl ${accent ? 'bg-white/15' : 'bg-muted-bg'}`}>
          <Icon size={16} className={accent ? 'text-primary-foreground' : 'text-primary'} />
        </div>
      </div>

      <div className="flex items-end justify-between gap-2">
        <span
          className={`text-3xl font-bold tracking-tight ${accent ? 'text-primary-foreground' : 'text-text-main'}`}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-semibold text-text-main">{children}</h2>;
}

export function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-xl px-3 py-2 shadow-lg text-sm">
      <p className="text-text-muted mb-1.5 font-medium">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          <span className="text-text-muted capitalize">{p.name}:</span>
          <span className="text-text-main font-semibold">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

export function DataState({ data }: { data: DashboardResponse }) {
  const { metrics, dailyVolume, failureReasons, recentActivity } = data;

  const chartData = dailyVolume.map((d) => ({
    ...d,
    day: format(parseISO(d.date), 'MMM d'),
  }));

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Events Delivered"
          value={metrics.totalDelivered.toLocaleString()}
          icon={Zap}
        />
        <MetricCard
          label="Failed Deliveries"
          value={metrics.totalFailed.toLocaleString()}
          icon={XCircle}
        />
        <MetricCard label="Success Rate" value={`${metrics.successRate}%`} icon={CheckCircle2} />
        <MetricCard
          label="Avg. Latency"
          value={metrics.avgLatencyMs !== null ? `${metrics.avgLatencyMs}ms` : '—'}
          icon={AlertTriangle}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-surface border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-6">
            <SectionTitle>Event Volume</SectionTitle>
            <div className="flex items-center gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 rounded-full bg-primary inline-block" />
                Delivered
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 rounded-full bg-red-400 inline-block" />
                Failed
              </span>
            </div>
          </div>
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-[220px] text-text-muted text-sm">
              No data for selected range
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradDelivered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradFailed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="delivered"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#gradDelivered)"
                  dot={false}
                  activeDot={{ r: 4, fill: 'var(--primary)' }}
                />
                <Area
                  type="monotone"
                  dataKey="failed"
                  stroke="#f87171"
                  strokeWidth={2}
                  fill="url(#gradFailed)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#f87171' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col">
          <div className="mb-4">
            <SectionTitle>Failures by Reason</SectionTitle>
            <p className="text-xs text-text-muted mt-0.5">Distribution across selected range</p>
          </div>
          {failureReasons.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
              No failures in selected range
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-4">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={failureReasons}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {failureReasons.map((entry) => (
                      <Cell key={entry.code} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload as (typeof failureReasons)[0];
                      return (
                        <div className="bg-surface border border-border rounded-xl px-3 py-2 shadow-lg text-sm max-w-[200px]">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ background: d.color }}
                            />
                            <span className="text-text-main font-semibold">{d.name}</span>
                          </div>
                          <p className="text-text-muted text-xs">{d.description}</p>
                          <p className="text-text-main font-bold mt-1">
                            {d.count.toLocaleString()}{' '}
                            <span className="text-text-muted font-normal">({d.value}%)</span>
                          </p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-1 gap-2">
                {failureReasons.map((r) => (
                  <div key={r.code} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: r.color }}
                      />
                      <span className="text-xs text-text-muted">{r.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-text-main">
                        {r.count.toLocaleString()}
                      </span>
                      <span className="text-xs text-text-muted">({r.value}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>Recent Activity</SectionTitle>
          <span className="text-xs text-text-muted">Last {recentActivity.length} deliveries</span>
        </div>
        {recentActivity.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-text-muted text-sm">
            No recent events
          </div>
        ) : (
          <div className="divide-y divide-border overflow-x-auto">
            {recentActivity.map((evt, idx) => {
              const isDelivered = evt.status === 'COMPLETED';
              const isFailed = evt.status === 'FAILED';
              return (
                <div
                  key={`${evt.eventUid}-${idx}`}
                  className="flex items-center gap-4 py-2.5 min-w-0"
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${isDelivered ? 'bg-emerald-400' : isFailed ? 'bg-red-400' : 'bg-yellow-400'}`}
                  />
                  <span className="font-mono text-xs text-text-muted w-28 shrink-0 truncate">
                    {evt.eventUid}
                  </span>
                  <span className="text-sm text-text-muted w-20 shrink-0 truncate">
                    {evt.appName}
                  </span>
                  <span className="text-sm text-text-main w-32 shrink-0 truncate">
                    {evt.eventType}
                  </span>
                  <span className="text-xs text-text-muted w-20 shrink-0">
                    Attempt {evt.attemptNumber}
                  </span>
                  <span className="text-xs text-text-muted flex-1 truncate" title={evt.endpointUrl}>
                    {evt.endpointUrl}
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                      isDelivered
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                        : isFailed
                          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400'
                    }`}
                  >
                    {evt.status.toLowerCase()}
                  </span>
                  <span className="text-xs text-text-muted shrink-0 w-20 text-right">
                    {formatRelativeTime(new Date(evt.createdAt))}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
