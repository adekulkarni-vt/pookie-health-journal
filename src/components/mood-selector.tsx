'use client';

import { cn } from '@/lib/utils';

const MOODS = [
  { value: 5, emoji: '😊', label: 'Great' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 2, emoji: '😔', label: 'Difficult' },
  { value: 1, emoji: '😣', label: 'Very Difficult' },
] as const;

interface MoodSelectorProps {
  value: number | null;
  onChange: (value: number) => void;
}

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        Overall Day Rating
      </label>
      <div className="flex gap-1 sm:gap-2">
        {MOODS.map((mood) => (
          <button
            key={mood.value}
            type="button"
            onClick={() => onChange(mood.value)}
            className={cn(
              'flex flex-col items-center gap-0.5 sm:gap-1 rounded-xl border-2 px-1.5 sm:px-3 py-1.5 sm:py-2 transition-all flex-1 min-w-0',
              value === mood.value
                ? 'border-pastel-pink bg-pastel-pink/10 shadow-sm'
                : 'border-transparent bg-card hover:border-border'
            )}
          >
            <span className="text-lg sm:text-xl">{mood.emoji}</span>
            <span
              className={cn(
                'text-[10px] sm:text-xs font-medium truncate w-full text-center',
                value === mood.value ? 'text-pastel-pink' : 'text-muted-foreground'
              )}
            >
              {mood.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
