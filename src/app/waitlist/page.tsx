'use client';

import { useRouter } from 'next/navigation';
import { Heart, LogOut } from 'lucide-react';
import { createSupabaseClient } from '@/lib/supabase/client';

export default function WaitlistPage() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary">
          <Heart className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">PookieHealth</h1>
        <p className="text-muted-foreground">
          Your account has been created but access has not yet been enabled.
        </p>
        <button
          onClick={handleLogout}
          className="mx-auto flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
