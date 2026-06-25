export function DashboardSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-56 bg-muted rounded" />
          <div className="h-4 w-40 bg-muted rounded" />
        </div>
        <div className="h-4 w-28 bg-muted rounded mt-1" />
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card shadow-sm h-28" />
          <div className="rounded-xl border border-border bg-card shadow-sm h-28" />
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm h-24" />

        <div className="rounded-xl border border-border bg-card shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 bg-muted rounded" />
            <div className="h-4 w-32 bg-muted rounded" />
          </div>
          <div className="h-[280px] rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}
