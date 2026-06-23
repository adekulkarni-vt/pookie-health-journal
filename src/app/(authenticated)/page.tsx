import { getCurrentUser } from '@/lib/auth';
import { getDashboardData } from '@/lib/dashboard';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

export default async function Home() {
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

  return (
    <DashboardShell initialData={{ ...data, userName }} />
  );
}
