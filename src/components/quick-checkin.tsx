'use client';

import { Moon, Weight } from 'lucide-react';
import { MoodSelector } from './mood-selector';
import { StressSlider } from './stress-slider';

export interface CheckInData {
  sleep_hours: number | null;
  weight: number | null;
  stress_level: number | null;
  mood: number | null;
}

interface QuickCheckInProps {
  data: CheckInData;
  onChange: (data: CheckInData) => void;
}

export function QuickCheckIn({ data, onChange }: QuickCheckInProps) {
  const update = (partial: Partial<CheckInData>) => {
    onChange({ ...data, ...partial });
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-4 sm:p-5 space-y-4 sm:space-y-5">
      <h3 className="text-sm font-semibold text-foreground">Quick Daily Check-In</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Moon className="h-4 w-4 text-muted-foreground" />
            Sleep Hours
          </label>
          <input
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={data.sleep_hours ?? ''}
            onChange={(e) => update({ sleep_hours: e.target.value ? Number(e.target.value) : null })}
            placeholder="7.5"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Weight className="h-4 w-4 text-muted-foreground" />
            Weight
          </label>
          <input
            type="number"
            min="0"
            max="500"
            step="0.1"
            value={data.weight ?? ''}
            onChange={(e) => update({ weight: e.target.value ? Number(e.target.value) : null })}
            placeholder="58.5"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors"
          />
        </div>
      </div>

      <StressSlider
        value={data.stress_level}
        onChange={(v) => update({ stress_level: v })}
      />

      <MoodSelector
        value={data.mood}
        onChange={(v) => update({ mood: v })}
      />
    </div>
  );
}
