import type { Mood } from './index';

export type DashboardData = {
  streak: StreakData;
  todayStatus: TodayStatus | null;
  weeklyTrends: WeeklyTrends;
  pookieInsight: string | null;
  userName: string | null;
};

export type StreakData = {
  current: number;
  active: boolean;
};

export type TodayStatus = {
  hasEntry: boolean;
  mood: Mood | null;
  severity: number | null;
  sleep_hours: number | null;
  stress_level: number | null;
};

export type WeeklyTrends = {
  dates: string[];
  labels: string[];
  severity: (number | null)[];
  mood: (number | null)[];
  stress: (number | null)[];
  sleep: (number | null)[];
  rawSeverity: (number | null)[];
  rawMood: (string | null)[];
  rawStress: (number | null)[];
  rawSleep: (number | null)[];
  entryIds: (string | null)[];
};
