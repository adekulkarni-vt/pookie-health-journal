import { Suspense } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { getDashboardData } from '@/lib/dashboard';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';

async function DashboardContent() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  const data = await getDashboardData(user.id);

  const fullName = user.user_metadata?.full_name as string | undefined;
  const userName = fullName
    ? fullName.split(' ')[0]
    : user.email?.split('@')[0] ?? null;

  return <DashboardShell initialData={{ ...data, userName }} />;
}

export default function Home() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
