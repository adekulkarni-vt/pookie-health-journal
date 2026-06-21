'use client';

import Link from 'next/link';
import { Heart, BarChart3, MessageSquare, Award, Menu, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
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
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export function AuthenticatedNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createSupabaseClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const navItems = [
    { href: '/', label: 'Home', icon: Heart },
    { href: '/journey', label: 'My Journey', icon: BarChart3 },
    { href: '/ask', label: 'Ask My Diary', icon: MessageSquare },
    { href: '/wins', label: 'Wins', icon: Award },
  ];

  const handleLogout = async () => {
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const displayName =
    user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Heart className="h-6 w-6 text-pastel-pink" />
            <span className="text-xl font-semibold text-gray-900">PookieHealth</span>
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
                    : 'text-gray-600 hover:bg-gray-100'
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
              <SheetTrigger className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 transition-colors">
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
                          : 'text-gray-600 hover:bg-gray-100'
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
                        src={user?.user_metadata?.avatar_url}
                        alt={displayName}
                      />
                      <AvatarFallback className="bg-pastel-pink text-sm font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email}
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
