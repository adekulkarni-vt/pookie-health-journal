'use client';

import { Moon, Heart } from 'lucide-react';
import type { TodayStatus as TodayStatusType } from '@/types/dashboard';
import type { Mood } from '@/types';

const MOOD_EMOJIS: Record<Mood, string> = {
  happy: '😊',
  good: '🙂',
  neutral: '😐',
  anxious: '😰',
  stressed: '😫',
  sad: '😢',
  frustrated: '😤',
  tired: '😴',
};

interface Props {
  data: TodayStatusType | null;
}

export function TodayStatus({ data }: Props) {
  if (!data || !data.hasEntry) {
    return (
      <div className="rounded-xl border border-border bg-card shadow-sm p-4 h-full flex flex-col items-center justify-center">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Today</h3>
        <p className="text-xs text-muted-foreground text-center">
          No journal entry yet today.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-4 h-full">
      <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">Today</h3>
      <div className="space-y-1.5">
        {data.mood && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Mood</span>
            <span className="text-foreground font-medium">
              {data.mood} {MOOD_EMOJIS[data.mood] ?? ''}
            </span>
          </div>
        )}
        {data.severity != null && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Severity</span>
            <span className="text-foreground font-medium">
              {data.severity} / 5
            </span>
          </div>
        )}
        {data.sleep_hours != null && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <Moon className="h-3 w-3" />
              Sleep
            </span>
            <span className="text-foreground font-medium">
              {data.sleep_hours} hrs
            </span>
          </div>
        )}
        {data.stress_level != null && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <Heart className="h-3 w-3" />
              Stress
            </span>
            <span className="text-foreground font-medium">
              {data.stress_level} / 10
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
