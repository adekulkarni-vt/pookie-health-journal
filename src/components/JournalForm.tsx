'use client';

import { useState, useCallback } from 'react';
import { Loader2, Sparkles, Calendar } from 'lucide-react';
import { VoiceJournalInput } from '@/components/voice-journal-input';
import { QuickCheckIn } from '@/components/quick-checkin';
import type { CheckInData } from '@/components/quick-checkin';
import { PhotoUpload } from '@/components/photo-upload';
import { cn } from '@/lib/utils';

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export interface JournalFormProps {
  initialDate?: string;
  initialText?: string;
  initialCheckIn?: CheckInData;
  initialPhotos?: File[];
  onSave: (data: {
    entryDate: string;
    journalText: string;
    checkIn: CheckInData;
    photos: File[];
  }) => Promise<void>;
  onCancel?: () => void;
  isEdit?: boolean;
}

export function JournalForm({
  initialDate,
  initialText,
  initialCheckIn,
  initialPhotos,
  onSave,
  onCancel,
  isEdit = false,
}: JournalFormProps) {
  const [entryDate, setEntryDate] = useState(initialDate ?? todayISO());
  const [checkIn, setCheckIn] = useState<CheckInData>(
    initialCheckIn ?? {
      sleep_hours: 7,
      weight: null,
      stress_level: 3,
      mood: 3,
    }
  );
  const [journalText, setJournalText] = useState(initialText ?? '');
  const [photos, setPhotos] = useState<File[]>(initialPhotos ?? []);
  const [saving, setSaving] = useState(false);
  const [journalKey, setJournalKey] = useState(0);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await onSave({ entryDate, journalText, checkIn, photos });
      setEntryDate(todayISO());
      setCheckIn({ sleep_hours: 7, weight: null, stress_level: 3, mood: 3 });
      setJournalText('');
      setPhotos([]);
      setJournalKey((k) => k + 1);
    } catch {
      // error handled by parent
    } finally {
      setSaving(false);
    }
  }, [checkIn, journalText, photos, onSave, entryDate]);

  return (
    <div className="flex-1 p-5 space-y-5 overflow-y-auto">
      <div className="flex items-center gap-3">
        <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
        <input
          type="date"
          value={entryDate}
          onChange={(e) => setEntryDate(e.target.value)}
          max={todayISO()}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors"
        />
      </div>

      <QuickCheckIn data={checkIn} onChange={setCheckIn} />

      <VoiceJournalInput
        key={journalKey}
        initialText={initialText}
        onTextChange={setJournalText}
        placeholder="What did you eat today? How did your stomach feel? Anything unusual happen?"
      />

      <PhotoUpload photos={photos} onChange={setPhotos} />

      <div className="flex items-center gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl px-6 py-3 text-sm font-semibold border border-border text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={cn(
            'flex items-center justify-center gap-2 flex-1 rounded-xl px-6 py-3 text-sm font-semibold shadow-sm transition-all',
            saving
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-dark-pink text-white hover:bg-dark-pink/90 hover:shadow-md active:scale-[0.98]'
          )}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              {isEdit ? 'Save Changes' : 'Save Entry'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
