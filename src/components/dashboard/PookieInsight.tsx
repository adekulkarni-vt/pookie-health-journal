'use client';

import { Sparkles } from 'lucide-react';

interface Props {
  insight: string | null;
}

export function PookieInsight({ insight }: Props) {
  if (!insight) return null;

  return (
    <div className="rounded-xl border border-pastel-pink/40 bg-pastel-pink/10 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-pastel-pink" />
        <h3 className="text-sm font-semibold text-foreground">Pookie Insight</h3>
      </div>
      <p className="text-sm text-foreground/80 leading-relaxed">{insight}</p>
    </div>
  );
}
