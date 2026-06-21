'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { VoiceJournalInput } from '@/components/voice-journal-input';
import { QuickCheckIn } from '@/components/quick-checkin';
import type { CheckInData } from '@/components/quick-checkin';
import { PhotoUpload } from '@/components/photo-upload';
import { createSupabaseClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function Home() {
  const [checkIn, setCheckIn] = useState<CheckInData>({
    sleep_hours: 7,
    weight: null,
    stress_level: 3,
    mood: 3,
  });
  const [journalText, setJournalText] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [journalKey, setJournalKey] = useState(0);
  const { toast } = useToast();

  const handleSave = useCallback(async () => {
    setSaving(true);

    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: journalText || null,
          sleep_hours: checkIn.sleep_hours,
          weight: checkIn.weight,
          stress_level: checkIn.stress_level,
          mood: checkIn.mood,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save entry');
      }

      const entryId: string = data.entry.id;

      if (photos.length > 0) {
        const supabase = createSupabaseClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const userId = user?.id;

        if (userId) {
          const uploads = photos.map(async (file) => {
            const ext = file.name.split('.').pop() || 'jpg';
            const path = `${userId}/${entryId}/${crypto.randomUUID()}.${ext}`;

            const { error: uploadError } = await supabase.storage
              .from('entry-photos')
              .upload(path, file);

            if (uploadError) throw uploadError;

            const { error: dbError } = await supabase
              .from('photos')
              .insert({ entry_id: entryId, storage_path: path, user_id: userId });

            if (dbError) throw dbError;
          });

          await Promise.all(uploads);
        }
      }

      setCheckIn({
        sleep_hours: 7,
        weight: null,
        stress_level: 3,
        mood: 3,
      });
      setJournalText('');
      setPhotos([]);
      setJournalKey((k) => k + 1);
      toast('Entry saved successfully', 'success');
    } catch (err) {
      toast(
        err instanceof Error ? err.message : 'Something went wrong',
        'error'
      );
    } finally {
      setSaving(false);
    }
  }, [checkIn, journalText, photos, toast]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
          How are you feeling today? 🌷
        </h1>
        <p className="text-sm text-muted-foreground">
          Tell me about your day, meals, symptoms, stress, sleep, or anything on
          your mind.
        </p>
      </div>

      <QuickCheckIn data={checkIn} onChange={setCheckIn} />

      <VoiceJournalInput
        key={journalKey}
        onTextChange={setJournalText}
        placeholder="What did you eat today? How did your stomach feel? Anything unusual happen?"
      />

      <PhotoUpload photos={photos} onChange={setPhotos} />

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className={cn(
          'flex items-center justify-center gap-2 w-full rounded-xl px-6 py-3 text-sm font-semibold shadow-sm transition-all',
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
            Save Today&apos;s Entry
          </>
        )}
      </button>

      <Link
        href="/journey"
        className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-pastel-pink transition-colors py-2"
      >
        View My Journey
        <ArrowRight className="h-4 w-4" />
      </Link>


    </div>
  );
}
