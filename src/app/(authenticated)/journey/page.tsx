'use client';

import { useState, useCallback } from 'react';
import { Timeline } from '@/components/timeline';
import { JournalDialog } from '@/components/JournalDialog';
import type { JournalEntry } from '@/types';

export default function JourneyPage() {
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = useCallback((entry: JournalEntry) => {
    setEditingEntry(entry);
  }, []);

  const handleSaved = useCallback(() => {
    setRefreshTrigger((t) => t + 1);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
        My Journey
      </h1>

      <Timeline refreshTrigger={refreshTrigger} onEdit={handleEdit} />

      <JournalDialog
        open={!!editingEntry}
        entry={editingEntry ?? undefined}
        onClose={() => setEditingEntry(null)}
        onSaved={handleSaved}
      />
    </div>
  );
}
