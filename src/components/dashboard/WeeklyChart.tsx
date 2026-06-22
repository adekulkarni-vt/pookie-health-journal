'use client';

import { useState, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { WeeklyTrends } from '@/types/dashboard';

const COLORS: Record<string, string> = {
  severity: '#E86B8A',
  mood: '#22c55e',
  stress: '#f59e0b',
  sleep: '#6366f1',
};

const METRICS = [
  { key: 'severity', label: 'Severity', color: COLORS.severity },
  { key: 'mood', label: 'Mood', color: COLORS.mood },
  { key: 'stress', label: 'Stress', color: COLORS.stress },
  { key: 'sleep', label: 'Sleep', color: COLORS.sleep },
];

const Y_TICKS = [0, 20, 40, 60, 80, 100];

interface CustomTooltipProps {
  active?: boolean;
  payload?: { dataKey: string; value: number | null }[];
  label?: string;
  raw?: {
    severity: (number | null)[];
    mood: (string | null)[];
    stress: (number | null)[];
    sleep: (number | null)[];
  };
  index?: number;
  selectedMetric: string | null;
}

function CustomTooltip({ active, payload, label, raw, index, selectedMetric }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0 || index == null || !raw) return null;

  const rows = selectedMetric
    ? METRICS.filter((m) => m.key === selectedMetric)
    : METRICS;

  const val = (key: string): string => {
    switch (key) {
      case 'severity': return raw.severity[index] != null ? `${raw.severity[index]} / 5` : '—';
      case 'mood': return raw.mood[index] ?? '—';
      case 'stress': return raw.stress[index] != null ? `${raw.stress[index]} / 10` : '—';
      case 'sleep': return raw.sleep[index] != null ? `${raw.sleep[index]} hrs` : '—';
      default: return '—';
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-lg text-sm space-y-1.5">
      <p className="font-semibold text-foreground mb-1.5">{label}</p>
      {rows.map(({ key, label, color }) => (
        <div key={key} className="flex items-center gap-2 text-muted-foreground">
          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="min-w-[4rem]">{label}:</span>
          <span className="font-medium text-foreground">{val(key)}</span>
        </div>
      ))}
    </div>
  );
}

interface Props {
  data: WeeklyTrends;
  onDateClick?: (date: string) => void;
}

export function WeeklyChart({ data, onDateClick }: Props) {
  const [selectedMetric, setSelectedMetric] = useState<string | null>('severity');

  const chartData = data.dates.map((date, i) => ({
    date,
    label: data.labels[i],
    severity: data.severity[i],
    mood: data.mood[i],
    stress: data.stress[i],
    sleep: data.sleep[i],
  }));

  const handleDotClick = useCallback(
    (entry: (typeof chartData)[number]) => {
      if (onDateClick && entry.date) onDateClick(entry.date);
    },
    [onDateClick]
  );

  const visibleMetrics = selectedMetric
    ? METRICS.filter((m) => m.key === selectedMetric)
    : METRICS;

  if (chartData.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Selector bar */}
      <div className="flex flex-wrap gap-2">
        {METRICS.map(({ key, label, color }) => {
          const active = selectedMetric === key || (!selectedMetric);
          return (
            <button
              key={key}
              type="button"
              onClick={() =>
                setSelectedMetric((prev) => (prev === key ? null : key))
              }
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors"
              style={{
                backgroundColor: active ? `${color}18` : 'transparent',
                color: active ? color : '#9ca3af',
                border: `1px solid ${active ? color : '#e5e7eb'}`,
              }}
            >
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              {label}
            </button>
          );
        })}
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            ticks={Y_TICKS}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip
            content={
              <CustomTooltip
                raw={{
                  severity: data.rawSeverity,
                  mood: data.rawMood,
                  stress: data.rawStress,
                  sleep: data.rawSleep,
                }}
                selectedMetric={selectedMetric}
              />
            }
          />
          {visibleMetrics.map(({ key, label, color }) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={label}
              stroke={color}
              strokeWidth={2.5}
              dot={(dotProps: Record<string, unknown>) => {
                const { cx, cy, index: dotIdx } = dotProps;
                if (cx == null || cy == null || typeof dotIdx !== 'number') return null;
                return (
                  <circle
                    cx={cx as number}
                    cy={cy as number}
                    r={5}
                    fill={color}
                    stroke="#fff"
                    strokeWidth={1.5}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleDotClick(chartData[dotIdx])}
                  />
                );
              }}
              activeDot={{ r: 7, fill: color, stroke: '#fff', strokeWidth: 2 }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
