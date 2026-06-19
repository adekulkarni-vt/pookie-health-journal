'use client';

import Link from 'next/link';
import { Heart, BarChart3, MessageSquare, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: Heart },
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/ask', label: 'Ask', icon: MessageSquare },
    { href: '/wins', label: 'Wins', icon: Award },
  ];

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-pastel-pink" />
            <span className="text-xl font-semibold text-gray-900">Pookie</span>
          </Link>

          <div className="hidden gap-1 md:flex">
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

          {/* Mobile menu */}
          <div className="flex gap-2 md:hidden">
            {navItems.map(({ href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'rounded-lg p-2 transition-colors',
                  pathname === href
                    ? 'bg-pastel-pink text-gray-900'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <Icon className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
