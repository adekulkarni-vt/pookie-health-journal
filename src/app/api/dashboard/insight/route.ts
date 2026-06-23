import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { requireWhitelist } from '@/lib/whitelist';
import { createServiceClient } from '@/lib/supabase/service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { REGENERATE_INSIGHT_PROMPT } from '@/gemini/prompts';

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
  try {
    const user = await requireUser();
    if (user.email) await requireWhitelist(user.email);
    const supabase = createServiceClient();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const startStr = sevenDaysAgo.toISOString().split('T')[0];

    const { data: recentEntries } = await supabase
      .from('entries')
      .select('entry_date, ai_summary, mood, severity, sleep_hours, stress_level')
      .eq('user_id', user.id)
      .gte('entry_date', startStr)
      .order('entry_date', { ascending: false });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
      },
    });

    const prompt = REGENERATE_INSIGHT_PROMPT({
      recentEntries: recentEntries ?? [],
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const cleaned = responseText
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    const braceStart = cleaned.indexOf('{');
    const braceEnd = cleaned.lastIndexOf('}');
    const jsonStr = braceStart !== -1 && braceEnd !== -1
      ? cleaned.slice(braceStart, braceEnd + 1)
      : cleaned;

    const parsed = JSON.parse(jsonStr);
    const insight = typeof parsed.dashboard_insight === 'string'
      ? parsed.dashboard_insight
      : null;

    if (!insight) {
      return NextResponse.json(
        { error: 'Failed to generate insight' },
        { status: 500 }
      );
    }

    await supabase
      .from('dashboard_insights')
      .delete()
      .eq('user_id', user.id);

    await supabase
      .from('dashboard_insights')
      .insert({
        user_id: user.id,
        insight,
        source_entry_date: new Date().toISOString().split('T')[0],
      });

    return NextResponse.json({ insight });
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
    console.error('Dashboard insight POST error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
