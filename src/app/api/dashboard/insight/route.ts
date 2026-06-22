import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { requireWhitelist } from '@/lib/whitelist';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET() {
  try {
    const user = await requireUser();
    if (user.email) await requireWhitelist(user.email);
    const supabase = createServiceClient();

    const { data: row } = await supabase
      .from('dashboard_insights')
      .select('insight')
      .eq('user_id', user.id)
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({ insight: row?.insight ?? null });
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
    console.error('Dashboard insight GET error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Direct insight generation is deprecated. Insight is now generated inline during entry save.' },
    { status: 410 }
  );
}
