'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, PenLine, StickyNote } from 'lucide-react';
import { FloatingActionMenu } from '@/components/FloatingActionMenu';
import { JournalDialog } from '@/components/JournalDialog';
import { QuickNoteDialog } from '@/components/QuickNoteDialog';
import { StreakCard } from '@/components/dashboard/StreakCard';
import { TodayStatus } from '@/components/dashboard/TodayStatus';
import { WeeklyTrends } from '@/components/dashboard/WeeklyTrends';
import { PookieInsight } from '@/components/dashboard/PookieInsight';
import type { DashboardData } from '@/types/dashboard';
import type { JournalEntry } from '@/types';

interface Props {
  initialData: DashboardData;
}

export function DashboardShell({ initialData }: Props) {
  const [data, setData] = useState<DashboardData>(initialData);
  const [refreshKey, setRefreshKey] = useState(0);
  const [journalOpen, setJournalOpen] = useState(false);
  const [quickNoteOpen, setQuickNoteOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    if (refreshKey === 0) return;

    let cancelled = false;

    async function refreshDashboard() {
      try {
        const res = await fetch('/api/dashboard');
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch {
        // silently fail
      }
    }

    refreshDashboard();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const handleSaved = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const handleRegenerateInsight = useCallback(async () => {
    const res = await fetch('/api/dashboard/insight', { method: 'POST' });
    if (!res.ok) return;
    const json = await res.json();
    setData((prev) => ({ ...prev, pookieInsight: json.insight }));
  }, []);

  const handleChartDateClick = useCallback(async (date: string) => {
    try {
      const res = await fetch('/api/entries');
      if (!res.ok) return;
      const json = await res.json();
      const entry: JournalEntry | undefined = (json.entries ?? []).find(
        (e: JournalEntry) => e.entry_date === date
      );
      if (entry) setEditingEntry(entry);
    } catch {
      // silently fail
    }
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
            Welcome back{data.userName ? `, ${data.userName}` : ''} 🌷
          </h1>
          <p className="text-sm text-muted-foreground">
            Your daily health dashboard
          </p>
        </div>
        <Link
          href="/journey"
          className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground hover:text-pastel-pink transition-colors shrink-0 mt-1"
        >
          View All Entries
          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </Link>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <StreakCard data={data.streak} />
          <TodayStatus data={data.todayStatus} />
        </div>

        <PookieInsight
          insight={data.pookieInsight}
          onRegenerate={handleRegenerateInsight}
        />

        <WeeklyTrends
          data={data.weeklyTrends}
          onDateClick={handleChartDateClick}
        />
      </div>

      <FloatingActionMenu
        actions={[
          {
            label: 'Add Log',
            icon: <PenLine className="h-4 w-4" />,
            onClick: () => setJournalOpen(true),
          },
          {
            label: 'Add Quick Note',
            icon: <StickyNote className="h-4 w-4" />,
            onClick: () => setQuickNoteOpen(true),
          },
        ]}
      />

      <JournalDialog
        open={journalOpen}
        onClose={() => setJournalOpen(false)}
        onSaved={handleSaved}
      />

      <JournalDialog
        open={!!editingEntry}
        entry={editingEntry ?? undefined}
        onClose={() => setEditingEntry(null)}
        onSaved={handleSaved}
      />

      <QuickNoteDialog
        open={quickNoteOpen}
        onClose={() => setQuickNoteOpen(false)}
      />
    </div>
  );
}
