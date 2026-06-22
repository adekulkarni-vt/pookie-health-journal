'use client';

import { X } from 'lucide-react';
import { JournalForm } from '@/components/JournalForm';
import { createSupabaseClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { JournalEntry } from '@/types';
import type { JournalFormProps } from '@/components/JournalForm';

interface JournalDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  entry?: JournalEntry;
}

export function JournalDialog({ open, onClose, onSaved, entry }: JournalDialogProps) {
  const { toast } = useToast();
  const isEdit = !!entry;

  if (!open) return null;

  const handleSave: JournalFormProps['onSave'] = async (formData) => {
    const { entryDate, journalText, checkIn, photos } = formData;
    const resource = isEdit && entry ? `/api/entries/${entry.id}` : '/api/entries';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(resource, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entry_date: entryDate,
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

    toast('Entry saved successfully', 'success');
    onSaved?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center">
      <div
        className="fixed inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative z-10 w-full sm:max-w-lg h-full sm:h-auto sm:max-h-[85vh] overflow-y-auto rounded-none sm:rounded-2xl bg-card border-0 sm:border-border shadow-xl animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-200 flex flex-col">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-pastel-pink/30 bg-pastel-pink px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? 'Edit Log' : 'Add Log'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <JournalForm
          key={entry?.id ?? 'create'}
          initialDate={entry?.entry_date}
          initialText={entry?.journal_text}
          initialCheckIn={
            entry
              ? {
                  sleep_hours: entry.sleep_hours,
                  weight: entry.weight,
                  stress_level: entry.stress_level,
                  mood: entry.day_rating,
                }
              : undefined
          }
          onSave={handleSave}
          onCancel={onClose}
          isEdit={isEdit}
        />
      </div>
    </div>
  );
}
