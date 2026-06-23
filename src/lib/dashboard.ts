import { createServiceClient } from './supabase/service';
import type { TodayStatus, WeeklyTrends, StreakData } from '@/types/dashboard';
import type { Mood } from '@/types';
import { MOOD_VALUES } from '@/types';

const MOOD_SCORE: Record<string, number> = {
  happy: 100,
  good: 80,
  neutral: 60,
  tired: 50,
  anxious: 40,
  stressed: 20,
  sad: 10,
  frustrated: 10,
};

function normalizeSeverity(val: number | null): number | null {
  if (val == null) return null;
  return Math.round(((val - 1) / 4) * 100);
}

function normalizeStress(val: number | null): number | null {
  if (val == null) return null;
  return Math.round(((val - 1) / 9) * 100);
}

function normalizeMood(val: string | null): number | null {
  if (!val) return null;
  return MOOD_SCORE[val] ?? null;
}

function normalizeSleep(val: number | null): number | null {
  if (val == null) return null;
  return Math.min(Math.round((val / 9) * 100), 100);
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - d.getTime()) / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

function calculateStreak(
  entries: { entry_date: string }[],
  todayStr: string
): StreakData {
  if (entries.length === 0) return { current: 0, active: false };

  const dates = [...new Set(entries.map((e) => e.entry_date))].sort(
    (a, b) => b.localeCompare(a)
  );

  const active = dates[0] === todayStr;
  const startDate = active
    ? todayStr
    : new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let streak = 0;
  let cursor = startDate;

  for (const date of dates) {
    if (date === cursor) {
      streak++;
      const d = new Date(cursor + 'T12:00:00');
      d.setDate(d.getDate() - 1);
      cursor = d.toISOString().split('T')[0];
    } else if (date < cursor) {
      break;
    }
  }

  return { current: streak, active };
}

export async function getDashboardData(userId: string) {
  const supabase = createServiceClient();
  const todayStr = new Date().toISOString().split('T')[0];

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const startStr = sevenDaysAgo.toISOString().split('T')[0];

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const ninetyStartStr = ninetyDaysAgo.toISOString().split('T')[0];

  const [entriesResult, streakResult, insightResult] = await Promise.all([
    supabase
      .from('entries')
      .select('id, entry_date, mood, severity, sleep_hours, stress_level')
      .eq('user_id', userId)
      .gte('entry_date', startStr)
      .order('entry_date', { ascending: false }),
    supabase
      .from('entries')
      .select('entry_date')
      .eq('user_id', userId)
      .gte('entry_date', ninetyStartStr)
      .order('entry_date', { ascending: false }),
    supabase
      .from('dashboard_insights')
      .select('insight')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const allUserEntries = entriesResult.data ?? [];
  const streakEntries = streakResult.data ?? [];
  const insightRow = insightResult.data;

  const todayEntry = allUserEntries.find((e) => e.entry_date === todayStr);
  const todayStatus: TodayStatus | null = todayEntry
    ? {
        hasEntry: true,
        mood: MOOD_VALUES.includes(todayEntry.mood ?? '')
          ? (todayEntry.mood as Mood)
          : null,
        severity: todayEntry.severity,
        sleep_hours: todayEntry.sleep_hours,
        stress_level: todayEntry.stress_level,
      }
    : null;

  const dates: string[] = [];
  const labels: string[] = [];
  const severityArr: (number | null)[] = [];
  const moodArr: (number | null)[] = [];
  const stressArr: (number | null)[] = [];
  const sleepArr: (number | null)[] = [];
  const rawSeverityArr: (number | null)[] = [];
  const rawMoodArr: (string | null)[] = [];
  const rawStressArr: (number | null)[] = [];
  const rawSleepArr: (number | null)[] = [];
  const entryIdsArr: (string | null)[] = [];

  const entryByDate = new Map<string, typeof allUserEntries[0]>();
  for (const e of allUserEntries) {
    entryByDate.set(e.entry_date, e);
  }

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dates.push(dateStr);
    labels.push(getDayLabel(dateStr));

    const entry = entryByDate.get(dateStr);
    severityArr.push(normalizeSeverity(entry?.severity ?? null));
    moodArr.push(normalizeMood(entry?.mood ?? null));
    stressArr.push(normalizeStress(entry?.stress_level ?? null));
    sleepArr.push(normalizeSleep(entry?.sleep_hours ?? null));
    rawSeverityArr.push(entry?.severity ?? null);
    rawMoodArr.push(entry?.mood ?? null);
    rawStressArr.push(entry?.stress_level ?? null);
    rawSleepArr.push(entry?.sleep_hours ?? null);
    entryIdsArr.push(entry?.id ?? null);
  }

  const weeklyTrends: WeeklyTrends = {
    dates,
    labels,
    severity: severityArr,
    mood: moodArr,
    stress: stressArr,
    sleep: sleepArr,
    rawSeverity: rawSeverityArr,
    rawMood: rawMoodArr,
    rawStress: rawStressArr,
    rawSleep: rawSleepArr,
    entryIds: entryIdsArr,
  };

  const streak = calculateStreak(streakEntries, todayStr);

  return {
    streak,
    todayStatus,
    weeklyTrends,
    pookieInsight: insightRow?.insight ?? null,
  };
}
