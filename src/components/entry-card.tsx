'use client';

import { useState } from 'react';
import { Moon, Weight, Heart, Calendar, ImageOff } from 'lucide-react';
import type { JournalEntry, Mood } from '@/types';

const STRESS_LABELS: Record<number, string> = {
  1: 'Relaxed',
  2: 'Good',
  3: 'Moderate',
  4: 'Stressed',
  5: 'Very Stressed',
};

const SEVERITY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Excellent', color: 'text-green-600 bg-green-50' },
  2: { label: 'Mild', color: 'text-yellow-600 bg-yellow-50' },
  3: { label: 'Moderate', color: 'text-orange-600 bg-orange-50' },
  4: { label: 'Significant', color: 'text-red-600 bg-red-50' },
  5: { label: 'Severe', color: 'text-rose-700 bg-rose-50' },
};

const MOOD_EMOJIS: Record<Mood, string> = {
  happy: '😊',
  good: '🙂',
  neutral: '😐',
  anxious: '😰',
  stressed: '😫',
  sad: '😢',
  frustrated: '😤',
  tired: '😴',
};

interface EntryCardProps {
  entry: JournalEntry;
}

export function EntryCard({ entry }: EntryCardProps) {
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  const date = new Date(entry.created_at).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const shortDate = new Date(entry.created_at).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const moodEmoji = entry.mood ? MOOD_EMOJIS[entry.mood] : null;
  const severityInfo = entry.severity ? SEVERITY_LABELS[entry.severity] : null;

  return (
    <>
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">{date}</span>
              <span className="sm:hidden">{shortDate}</span>
            </div>
            <div className="flex items-center gap-2">
              {moodEmoji && (
                <span className="text-xl" title={entry.mood ?? ''}>{moodEmoji}</span>
              )}
            </div>
          </div>

          {entry.ai_title && (
            <h3 className="text-base font-semibold text-foreground leading-snug">
              {entry.ai_title}
            </h3>
          )}

          <div className="flex flex-wrap gap-2">
            {entry.sleep_hours != null && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Moon className="h-3.5 w-3.5" />
                <span>{entry.sleep_hours}h</span>
              </div>
            )}
            {entry.weight != null && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Weight className="h-3.5 w-3.5" />
                <span>{entry.weight} kg</span>
              </div>
            )}
            {entry.stress_level != null && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Heart className="h-3.5 w-3.5" />
                <span>{STRESS_LABELS[entry.stress_level]}</span>
              </div>
            )}
            {severityInfo && (
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${severityInfo.color}`}>
                {severityInfo.label}
              </span>
            )}
          </div>

          {entry.ai_summary && (
            <p className="text-sm text-foreground/80 leading-relaxed">
              {entry.ai_summary}
            </p>
          )}

          {entry.photos && entry.photos.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {entry.photos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => photo.url && !brokenImages.has(photo.id) && setExpandedPhoto(photo.url)}
                  className="aspect-square rounded-lg overflow-hidden border border-border hover:opacity-80 transition-opacity"
                >
                  {!photo.url || brokenImages.has(photo.id) ? (
                    <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">
                      <ImageOff className="h-5 w-5" />
                    </div>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={photo.url}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={() => setBrokenImages((prev) => new Set(prev).add(photo.id))}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {expandedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setExpandedPhoto(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={expandedPhoto}
            alt="Enlarged photo"
            className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl object-contain"
          />
        </div>
      )}
    </>
  );
}
