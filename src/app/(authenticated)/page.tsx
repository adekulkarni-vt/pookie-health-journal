'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, PenLine, StickyNote, Loader2 } from 'lucide-react';
import { FloatingActionMenu } from '@/components/FloatingActionMenu';
import { JournalDialog } from '@/components/JournalDialog';
import { QuickNoteDialog } from '@/components/QuickNoteDialog';
import { StreakCard } from '@/components/dashboard/StreakCard';
import { TodayStatus } from '@/components/dashboard/TodayStatus';
import { WeeklyTrends } from '@/components/dashboard/WeeklyTrends';
import { PookieInsight } from '@/components/dashboard/PookieInsight';
import type { DashboardData } from '@/types/dashboard';
import type { JournalEntry } from '@/types';

export default function Home() {
  const [journalOpen, setJournalOpen] = useState(false);
  const [quickNoteOpen, setQuickNoteOpen] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await fetch('/api/dashboard');
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDashboard();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const handleSaved = useCallback(() => {
    setRefreshKey((k) => k + 1);
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
            Welcome back{data?.userName ? `, ${data.userName}` : ''} 🌷
          </h1>
          <p className="text-sm text-muted-foreground">
            Your daily health dashboard
          </p>
        </div>
        <Link
          href="/journey"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-pastel-pink transition-colors shrink-0 mt-1"
        >
          View All Entries
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          {data && (
            <>
              {/* Row 1: Streak + Today Status side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StreakCard data={data.streak} />
                <TodayStatus data={data.todayStatus} />
              </div>

              {/* Row 2: Pookie Insight */}
              <PookieInsight insight={data.pookieInsight} />

              {/* Row 3: Weekly Trends (largest card) */}
              <WeeklyTrends
                data={data.weeklyTrends}
                onDateClick={handleChartDateClick}
              />
            </>
          )}
        </div>
      )}

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
