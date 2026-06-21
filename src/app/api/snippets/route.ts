import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { requireWhitelist } from '@/lib/whitelist';
import { createServiceClient } from '@/lib/supabase/service';

function todayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
  return { start, end };
}

export async function GET() {
  try {
    const user = await requireUser();
    if (user.email) await requireWhitelist(user.email);
    const supabase = createServiceClient();

    const { start, end } = todayRange();

    const { data, error } = await supabase
      .from('journal_snippets')
      .select('id, content, created_at')
      .eq('user_id', user.id)
      .gte('created_at', start)
      .lt('created_at', end)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ snippets: data ?? [] });
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
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    if (user.email) await requireWhitelist(user.email);
    const supabase = createServiceClient();

    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('journal_snippets')
      .insert({
        user_id: user.id,
        content: content.trim(),
      })
      .select('id, content, created_at')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ snippet: data }, { status: 201 });
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
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
