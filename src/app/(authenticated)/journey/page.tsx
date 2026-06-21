'use client';

import { Timeline } from '@/components/timeline';

export default function JourneyPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
          My Journey
        </h1>
        <p className="text-sm text-muted-foreground">
          Your health journal entries, newest first.
        </p>
      </div>

      <Timeline />
    </div>
  );
}
