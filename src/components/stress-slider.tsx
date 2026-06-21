'use client';

import { cn } from '@/lib/utils';

const LEVELS = [
  { value: 1, label: 'Relaxed' },
  { value: 2, label: 'Good' },
  { value: 3, label: 'Moderate' },
  { value: 4, label: 'Stressed' },
  { value: 5, label: 'Very Stressed' },
] as const;

interface StressSliderProps {
  value: number | null;
  onChange: (value: number) => void;
}

export function StressSlider({ value, onChange }: StressSliderProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        Stress Level
      </label>
      <div className="space-y-1">
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={value ?? 3}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer accent-pastel-pink bg-border
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pastel-pink
            [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
        />
        <div className="flex justify-between px-0.5">
          {LEVELS.map((level) => (
            <span
              key={level.value}
              className={cn(
                'text-[10px] sm:text-xs transition-colors text-center leading-tight',
                (value ?? 3) === level.value
                  ? 'text-pastel-pink font-medium'
                  : 'text-muted-foreground'
              )}
            >
              {level.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
