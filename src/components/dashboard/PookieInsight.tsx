'use client';

import { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

interface Props {
  insight: string | null;
  onRegenerate?: () => Promise<void>;
}

export function PookieInsight({ insight, onRegenerate }: Props) {
  const [regenerating, setRegenerating] = useState(false);

  if (!insight) return null;

  const handleRegenerate = async () => {
    if (!onRegenerate || regenerating) return;
    setRegenerating(true);
    try {
      await onRegenerate();
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="rounded-xl border border-pastel-pink/40 bg-pastel-pink/10 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-pastel-pink" />
          <h3 className="text-sm font-semibold text-foreground">Pookie Insight</h3>
        </div>
        {onRegenerate && (
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={regenerating}
            className="rounded-md p-1.5 text-muted-foreground hover:text-pastel-pink hover:bg-pastel-pink/10 transition-colors disabled:opacity-50"
            title="Regenerate insight"
          >
            <RefreshCw className={`h-4 w-4 ${regenerating ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
      <p className="text-sm text-foreground/80 leading-relaxed">{insight}</p>
    </div>
  );
}
