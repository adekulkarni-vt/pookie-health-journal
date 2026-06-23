import { getCurrentUser } from '@/lib/auth';
import { AuthenticatedNavigation } from '@/components/AuthenticatedNavigation';
import { ToastProvider } from '@/hooks/use-toast';
import { Toaster } from '@/components/toaster';

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  const displayName =
    user?.user_metadata?.name || user?.email?.split('@')[0] || '';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <ToastProvider>
      <AuthenticatedNavigation
        userEmail={user?.email ?? null}
        userDisplayName={displayName}
        userInitials={initials}
        userAvatarUrl={user?.user_metadata?.avatar_url ?? null}
      />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <Toaster />
    </ToastProvider>
  );
}
