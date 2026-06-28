'use client';

import Link from 'next/link';
import { Heart, BarChart3, MessageSquare, Menu, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import { UserMenu } from './UserMenu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createSupabaseClient } from '@/lib/supabase/client';

interface Props {
  userEmail: string | null;
  userDisplayName: string;
  userInitials: string;
  userAvatarUrl: string | null;
}

export function AuthenticatedNavigation({
  userEmail,
  userDisplayName,
  userInitials,
  userAvatarUrl,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: '/', label: 'Home', icon: Heart },
    { href: '/journey', label: 'My Journey', icon: BarChart3 },
    { href: '/ask', label: 'Ask My Diary', icon: MessageSquare },
  ];

  const handleLogout = async () => {
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <nav className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Heart className="h-6 w-6 text-pastel-pink" />
            <span className="text-xl font-semibold text-foreground">PookieHealth</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  pathname === href
                    ? 'bg-pastel-pink text-gray-900'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:block flex-shrink-0">
            <UserMenu />
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <Sheet>
              <SheetTrigger className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted transition-colors">
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader className="border-b border-border pb-4">
                  <SheetTitle>
                    <Link href="/" className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-pastel-pink" />
                      <span className="text-lg font-semibold">PookieHealth</span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col gap-1 px-4 pt-4">
                  {navItems.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        pathname === href
                          ? 'bg-pastel-pink text-gray-900'
                          : 'text-muted-foreground hover:bg-muted'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {label}
                    </Link>
                  ))}
                </nav>

                <div className="mt-auto border-t border-border p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={userAvatarUrl ?? undefined}
                        alt={userDisplayName}
                      />
                      <AvatarFallback className="bg-pastel-pink text-sm font-medium">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {userDisplayName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {userEmail}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
