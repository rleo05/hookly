'use client';

import { format, parseISO } from 'date-fns';
import { CalendarDays, CalendarSync, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Calendar } from '@/src/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';
import { useDashboard } from '@/src/hooks/use-dashboard';
import { DataState } from './dashboard-data-state';

function DatePickerButton({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? parseISO(value) : undefined;
  const min = minDate ? parseISO(minDate) : undefined;
  const max = maxDate ? parseISO(maxDate) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={
            'inline-flex items-center gap-2 h-8 px-3 rounded-lg border border-border ' +
            'bg-surface text-text-main text-sm font-medium ' +
            'hover:bg-hover-bg hover:border-primary/40 ' +
            'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary ' +
            'transition-colors cursor-pointer'
          }
        >
          <CalendarDays size={13} className="text-primary shrink-0" />
          <span className={value ? 'text-text-main' : 'text-text-muted'}>
            {value ? format(parseISO(value), 'MMM d, yyyy') : (placeholder ?? 'Pick date')}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6}>
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(day) => {
            if (day) {
              onChange(format(day, 'yyyy-MM-dd'));
              setOpen(false);
            }
          }}
          disabled={(day) => {
            if (min && day < min) return true;
            if (max && day > max) return true;
            return false;
          }}
          defaultMonth={selected ?? min ?? undefined}
          className="p-3"
        />
      </PopoverContent>
    </Popover>
  );
}

function DateRangePicker({
  start,
  end,
  onStartChange,
  onEndChange,
}: {
  start: string;
  end: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <DatePickerButton
        value={start}
        onChange={onStartChange}
        maxDate={end}
        placeholder="Start date"
      />
      <span className="text-xs text-text-muted">→</span>
      <DatePickerButton value={end} onChange={onEndChange} minDate={start} placeholder="End date" />
    </div>
  );
}

function Pulse({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`animate-pulse rounded-lg bg-border/50 ${className ?? ''}`} style={style} />
  );
}

function MetricCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Pulse className="h-4 w-24" />
        <Pulse className="h-8 w-8 rounded-xl" />
      </div>
      <Pulse className="h-9 w-20" />
    </div>
  );
}

function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-6">
        <Pulse className="h-5 w-32" />
        <Pulse className="h-3 w-40" />
      </div>
      <Pulse className="w-full" style={{ height }} />
    </div>
  );
}

function DonutChartSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col">
      <div className="mb-4">
        <Pulse className="h-5 w-40 mb-2" />
        <Pulse className="h-3 w-56" />
      </div>
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-center" style={{ height: 180 }}>
          <Pulse className="w-40 h-40 rounded-full" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pulse className="w-2 h-2 rounded-full" />
                <Pulse className="h-3 w-28" />
              </div>
              <Pulse className="h-3 w-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RecentActivitySkeleton() {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <Pulse className="h-5 w-32" />
        <Pulse className="h-3 w-24" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-2.5">
            <Pulse className="w-1.5 h-1.5 rounded-full" />
            <Pulse className="h-3 w-28" />
            <Pulse className="h-3 w-20" />
            <Pulse className="h-3 flex-1" />
            <Pulse className="h-5 w-18 rounded-full" />
            <Pulse className="h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

interface DashboardPanelProps {
  startDate: string;
  endDate: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  onReset?: () => void;
}

export function DashboardPanel({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  onReset,
}: DashboardPanelProps) {
  const { data, isLoading, isError } = useDashboard(startDate, endDate);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-text-main">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap ">
          <DateRangePicker
            start={startDate}
            end={endDate}
            onStartChange={onStartChange}
            onEndChange={onEndChange}
          />
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center h-8 px-3 rounded-lg text-xs font-medium text-text-muted border border-border bg-surface hover:border-primary/40 hover:text-primary transition-colors cursor-pointer rounded-full"
              title="Reset to current month"
            >
              <CalendarSync size={18} />
            </button>
          )}
        </div>
      </div>

      {isLoading ? <LoadingState /> : isError ? <ErrorState /> : <DataState data={data!} />}
    </div>
  );
}

function LoadingState() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ChartSkeleton />
        </div>
        <DonutChartSkeleton />
      </div>
      <RecentActivitySkeleton />
    </>
  );
}

function ErrorState() {
  return (
    <div className="bg-surface border border-red-300 dark:border-red-800 rounded-2xl p-8 text-center">
      <XCircle size={32} className="mx-auto mb-3 text-red-400" />
      <p className="text-text-main font-medium">Failed to load dashboard data</p>
      <p className="text-text-muted text-sm mt-1">Please try refreshing the page</p>
    </div>
  );
}
