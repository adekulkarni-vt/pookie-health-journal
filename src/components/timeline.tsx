'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { EntryCard } from './entry-card';
import type { JournalEntry } from '@/types';

interface TimelineProps {
  refreshTrigger?: number;
}

export function Timeline({ refreshTrigger = 0 }: TimelineProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchEntries() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/entries');

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to load entries');
        }

        const data = await res.json();
        if (!cancelled) setEntries(data.entries ?? []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load entries');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchEntries();

    return () => {
      cancelled = true;
    };
  }, [refreshTrigger, retry]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">My Journey</h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">My Journey</h2>
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <button
            type="button"
            onClick={() => setRetry((r) => r + 1)}
            className="mt-3 text-sm text-pastel-pink hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">My Journey</h2>
        <div className="rounded-xl border border-border bg-card p-10 text-center space-y-3">
          <span className="text-4xl">🌷</span>
          <p className="text-base font-medium text-foreground">
            Your journal begins today.
          </p>
          <p className="text-sm text-muted-foreground">
            Create your first entry to start tracking patterns.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">My Journey</h2>
      <div className="space-y-4">
        {entries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
