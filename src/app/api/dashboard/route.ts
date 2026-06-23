import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { requireWhitelist } from '@/lib/whitelist';
import { getDashboardData } from '@/lib/dashboard';
import type { DashboardData } from '@/types/dashboard';

export async function GET() {
  try {
    const user = await requireUser();
    if (user.email) await requireWhitelist(user.email);

    const result = await getDashboardData(user.id);

    const fullName = user.user_metadata?.full_name as string | undefined;
    const userName = fullName
      ? fullName.split(' ')[0]
      : user.email?.split('@')[0] ?? null;

    const dashboard: DashboardData = {
      ...result,
      userName,
    };

    return NextResponse.json(dashboard);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'Unauthorized: User not authenticated'
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (
      error instanceof Error &&
      error.message === 'Whitelist access denied'
    ) {
      return NextResponse.json(
        { error: 'Access not enabled for this account.' },
        { status: 403 }
      );
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Dashboard GET error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
