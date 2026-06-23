'use client';

import dynamic from 'next/dynamic';
import { TrendingUp } from 'lucide-react';
import type { WeeklyTrends as WeeklyTrendsType } from '@/types/dashboard';

const WeeklyChart = dynamic(
  () => import('./WeeklyChart').then((mod) => mod.WeeklyChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[280px] rounded-lg bg-muted animate-pulse" />
    ),
  }
);

interface Props {
  data: WeeklyTrendsType;
  onDateClick?: (date: string) => void;
}

export function WeeklyTrends({ data, onDateClick }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-pastel-pink" />
        <h3 className="text-sm font-semibold text-foreground">Weekly Trends</h3>
      </div>
      <WeeklyChart data={data} onDateClick={onDateClick} />
    </div>
  );
}
