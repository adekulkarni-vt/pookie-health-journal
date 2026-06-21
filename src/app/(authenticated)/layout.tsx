import { AuthenticatedNavigation } from '@/components/AuthenticatedNavigation';
import { ToastProvider } from '@/hooks/use-toast';
import { Toaster } from '@/components/toaster';
import { QuickNotesFab } from '@/components/QuickNotesFab';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <AuthenticatedNavigation />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <QuickNotesFab />
      <Toaster />
    </ToastProvider>
  );
}
