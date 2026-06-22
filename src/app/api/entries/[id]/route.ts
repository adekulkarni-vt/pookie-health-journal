import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { requireWhitelist } from '@/lib/whitelist';
import { createServiceClient } from '@/lib/supabase/service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { JOURNAL_AND_INSIGHT_PROMPT } from '@/gemini/prompts';
import { MOOD_VALUES } from '@/types';
import type { Mood } from '@/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    if (user.email) await requireWhitelist(user.email);
    const supabase = createServiceClient();

    const { id } = await params;

    const { data: entry, error } = await supabase
      .from('entries')
      .select('*, photos(*)')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    const photos = await Promise.all(
      (entry.photos || []).map(
        async (photo: { id: string; storage_path: string }) => {
          const { data: signedUrl } = await supabase.storage
            .from('entry-photos')
            .createSignedUrl(photo.storage_path, 60 * 60 * 24 * 365);
          return {
            id: photo.id,
            storage_path: photo.storage_path,
            url: signedUrl?.signedUrl ?? null,
          };
        }
      )
    );

    return NextResponse.json({ entry: { ...entry, photos } });
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
    console.error('Entries GET by ID error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    if (user.email) await requireWhitelist(user.email);
    const supabase = createServiceClient();

    const { id } = await params;

    const { data: existing } = await supabase
      .from('entries')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    const body = await request.json();
    const { text, sleep_hours, weight, stress_level, mood, entry_date } = body;

    if (
      !text &&
      sleep_hours == null &&
      weight == null &&
      stress_level == null &&
      mood == null &&
      !entry_date
    ) {
      return NextResponse.json(
        { error: 'At least one field is required' },
        { status: 400 }
      );
    }

    const journalText = text || '';
    const journalDate = entry_date || undefined;

    console.log(
      `[Entries PUT/${id}] Input: sleep=${sleep_hours} stress=${stress_level} weight=${weight} day_rating=${mood} text_len=${journalText.length}`
    );

    let ai_title: string | null = null;
    let ai_summary: string | null = null;
    let ai_mood: Mood | null = null;
    let severity: number | null = null;
    let dashboardInsight: string | null = null;

    if (journalText) {
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return NextResponse.json(
          { error: 'GEMINI_API_KEY is not configured' },
          { status: 500 }
        );
      }

      // Fetch recent entries for dashboard insight context
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const startStr = sevenDaysAgo.toISOString().split('T')[0];
      const { data: recentEntries } = await supabase
        .from('entries')
        .select('entry_date, ai_summary, mood, severity, sleep_hours, stress_level')
        .eq('user_id', user.id)
        .gte('entry_date', startStr)
        .order('entry_date', { ascending: false });

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash-lite',
      });

      const prompt = JOURNAL_AND_INSIGHT_PROMPT({
        journal_text: journalText,
        sleep_hours: sleep_hours ?? null,
        weight: weight ?? null,
        stress_level: stress_level ?? null,
        day_rating: mood ?? null,
        recentEntries: recentEntries ?? [],
      });

      try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        const cleaned = responseText
          .replace(/```json\s*/g, '')
          .replace(/```\s*/g, '')
          .trim();

        const braceStart = cleaned.indexOf('{');
        const braceEnd = cleaned.lastIndexOf('}');
        const jsonStr =
          braceStart !== -1 && braceEnd !== -1
            ? cleaned.slice(braceStart, braceEnd + 1)
            : cleaned;

        const parsed = JSON.parse(jsonStr);
        ai_title = parsed.title ?? null;
        ai_summary = parsed.summary ?? null;
        ai_mood = MOOD_VALUES.includes(parsed.mood)
          ? (parsed.mood as Mood)
          : null;
        severity =
          typeof parsed.severity === 'number' &&
          parsed.severity >= 1 &&
          parsed.severity <= 5
            ? parsed.severity
            : null;
        dashboardInsight = typeof parsed.dashboard_insight === 'string' ? parsed.dashboard_insight : null;
        console.log(
          `[Entries PUT/${id}] Gemini result: title="${ai_title}" mood=${ai_mood} severity=${severity} summary_len=${(ai_summary ?? '').length} insight_len=${(dashboardInsight ?? '').length}`
        );
      } catch (geminiError: unknown) {
        const message =
          geminiError instanceof Error
            ? geminiError.message
            : String(geminiError);
        console.error('Gemini memory generation error:', message);
        return NextResponse.json(
          { error: `AI processing failed: ${message}` },
          { status: 500 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (journalText) updateData.journal_text = journalText;
    if (sleep_hours !== undefined) updateData.sleep_hours = sleep_hours;
    if (weight !== undefined) updateData.weight = weight;
    if (stress_level !== undefined) updateData.stress_level = stress_level;
    if (mood !== undefined) updateData.day_rating = mood;
    if (journalDate) updateData.entry_date = journalDate;
    if (ai_title !== null) updateData.ai_title = ai_title;
    if (ai_summary !== null) updateData.ai_summary = ai_summary;
    if (ai_mood !== null) updateData.mood = ai_mood;
    if (severity !== null) updateData.severity = severity;

    const { data: updated, error } = await supabase
      .from('entries')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Save dashboard insight from the same Gemini response
    if (dashboardInsight) {
      await supabase
        .from('dashboard_insights')
        .delete()
        .eq('user_id', user.id);
      await supabase
        .from('dashboard_insights')
        .insert({
          user_id: user.id,
          insight: dashboardInsight,
          source_entry_date: journalDate ?? new Date().toISOString().split('T')[0],
        });
    }

    return NextResponse.json({ entry: updated, isUpdate: true });
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
    console.error('Entries PUT error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
