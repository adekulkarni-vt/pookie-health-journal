'use client';

import type { StreakData } from '@/types/dashboard';

interface Props {
  data: StreakData;
}

export function StreakCard({ data }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-4 h-full">
      <div className="flex flex-col items-center justify-center text-center h-full gap-1.5">
        <span className="text-3xl">🔥</span>
        <p className="text-xl font-bold text-foreground leading-tight">
          {data.current} Day Streak
        </p>
        <p className="text-xs text-muted-foreground leading-tight">
          {data.current > 0
            ? `${data.current} consecutive day${data.current === 1 ? '' : 's'}`
            : 'Start your first check-in today.'}
        </p>
      </div>
    </div>
  );
}
