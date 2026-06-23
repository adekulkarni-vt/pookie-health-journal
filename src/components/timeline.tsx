'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { EntryCard } from './entry-card';
import type { JournalEntry } from '@/types';

const STORAGE_KEY = 'pookie-journey-entries';
const PAGE_SIZE = 5;

let inFlightFetch: Promise<Response> | null = null;

interface TimelineProps {
  refreshTrigger?: number;
  onEdit?: (entry: JournalEntry) => void;
}

function loadCached(): JournalEntry[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveCache(entries: JournalEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // storage full or unavailable
  }
}

function EntryCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden p-4 sm:p-5 space-y-3 sm:space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-40 bg-muted rounded" />
        <div className="h-4 w-8 bg-muted rounded" />
      </div>
      <div className="h-5 w-3/4 bg-muted rounded" />
      <div className="flex gap-2">
        <div className="h-4 w-16 bg-muted rounded" />
        <div className="h-4 w-16 bg-muted rounded" />
        <div className="h-4 w-20 bg-muted rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-muted rounded" />
        <div className="h-3 w-5/6 bg-muted rounded" />
      </div>
    </div>
  );
}

export function Timeline({ refreshTrigger = 0, onEdit }: TimelineProps) {
  const [allEntries, setAllEntries] = useState<JournalEntry[]>(() => {
    const cached = loadCached();
    return cached ?? [];
  });
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  const hasCached = useRef(loadCached() !== null);

  useEffect(() => {
    async function fetchEntries() {
      try {
        setLoading(true);
        setError(null);

        if (!inFlightFetch) {
          inFlightFetch = fetch('/api/entries');
        }
        const res = await inFlightFetch;

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to load entries');
        }

        const data = await res.json();
        const entries: JournalEntry[] = data.entries ?? [];
        setAllEntries(entries);
        setDisplayCount(PAGE_SIZE);
        saveCache(entries);
        hasCached.current = true;
      } catch (err) {
        if (err instanceof TypeError && (err as Error).message === 'Failed to fetch') return;
        if (!hasCached.current) {
          setError(err instanceof Error ? err.message : 'Failed to load entries');
        }
      } finally {
        setLoading(false);
        inFlightFetch = null;
      }
    }

    fetchEntries();
  }, [refreshTrigger, retry]);

  const handleShowMore = useCallback(() => {
    setDisplayCount((prev) => prev + PAGE_SIZE);
  }, []);

  const displayedEntries = allEntries.slice(0, displayCount);
  const hasMore = displayCount < allEntries.length;

  if (error && allEntries.length === 0) {
    return (
      <div className="space-y-4">
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

  if (!loading && allEntries.length === 0) {
    return (
      <div className="space-y-4">
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
      {displayedEntries.map((entry) => (
        <EntryCard key={entry.id} entry={entry} onEdit={onEdit} />
      ))}

      {loading && !hasCached.current && (
        <>
          <EntryCardSkeleton />
          <EntryCardSkeleton />
          <EntryCardSkeleton />
        </>
      )}

      {hasMore && !loading && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={handleShowMore}
            className="rounded-xl px-6 py-3 text-sm font-medium text-pastel-pink border border-pastel-pink/30 hover:bg-pastel-pink/5 transition-colors"
          >
            See More
          </button>
        </div>
      )}
    </div>
  );
}
