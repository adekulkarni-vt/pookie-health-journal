import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { requireWhitelist } from '@/lib/whitelist';
import { createServiceClient } from '@/lib/supabase/service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { JOURNAL_MEMORY_PROMPT } from '@/gemini/prompts';
import { MOOD_VALUES } from '@/types';
import type { Mood } from '@/types';

export async function GET() {
  try {
    const user = await requireUser();
    if (user.email) await requireWhitelist(user.email);
    const supabase = createServiceClient();

    const { data: entries, error } = await supabase
      .from('entries')
      .select('*, photos(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const entriesWithUrls = await Promise.all(
      (entries ?? []).map(async (entry) => {
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
        return { ...entry, photos };
      })
    );

    return NextResponse.json({ entries: entriesWithUrls ?? [] });
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
    console.error('Entries GET error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function todayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
  return { start, end };
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    if (user.email) await requireWhitelist(user.email);
    const supabase = createServiceClient();

    const body = await request.json();
    const { text, sleep_hours, weight, stress_level, mood } = body;

    if (!text && sleep_hours == null && weight == null && stress_level == null && mood == null) {
      return NextResponse.json(
        { error: 'At least one field is required' },
        { status: 400 }
      );
    }

    const { start, end } = todayRange();

    const { data: snippets } = await supabase
      .from('journal_snippets')
      .select('content, created_at')
      .eq('user_id', user.id)
      .gte('created_at', start)
      .lt('created_at', end)
      .order('created_at', { ascending: true });

    const snippetCount = snippets?.length ?? 0;
    const snippetChars = (snippets ?? []).reduce((sum, s) => sum + s.content.length, 0);
    console.log({ snippetCount, snippetChars });

    let quickNotesBlock = '';
    if (snippets && snippets.length > 0) {
      quickNotesBlock = snippets
        .map((s) => {
          const time = new Date(s.created_at).toLocaleTimeString('en-US', {
            hour: 'numeric', minute: '2-digit', hour12: true,
          });
          return `${time}\n${s.content}`;
        })
        .join('\n\n');
    }

    console.log(`[Entries POST] Input: sleep=${sleep_hours} stress=${stress_level} weight=${weight} day_rating=${mood} text_len=${(text ?? '').length} snippets=${snippetCount}`);

    let ai_title: string | null = null;
    let ai_summary: string | null = null;
    let ai_mood: Mood | null = null;
    let severity: number | null = null;

    if (text) {
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
      });

      const prompt = JOURNAL_MEMORY_PROMPT({
        journal_text: text,
        sleep_hours: sleep_hours ?? null,
        weight: weight ?? null,
        stress_level: stress_level ?? null,
        day_rating: mood ?? null,
        quick_notes: quickNotesBlock || undefined,
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
        const jsonStr = braceStart !== -1 && braceEnd !== -1
          ? cleaned.slice(braceStart, braceEnd + 1)
          : cleaned;

        const parsed = JSON.parse(jsonStr);
        ai_title = parsed.title ?? null;
        ai_summary = parsed.summary ?? null;
        ai_mood = MOOD_VALUES.includes(parsed.mood) ? (parsed.mood as Mood) : null;
        severity = typeof parsed.severity === 'number' && parsed.severity >= 1 && parsed.severity <= 5
          ? parsed.severity
          : null;
        console.log(`[Entries POST] Gemini result: title="${ai_title}" mood=${ai_mood} severity=${severity} summary_len=${(ai_summary ?? '').length}`);
      } catch (geminiError: unknown) {
        const message = geminiError instanceof Error ? geminiError.message : String(geminiError);
        console.error('Gemini memory generation error:', message);
        return NextResponse.json(
          { error: `AI processing failed: ${message}` },
          { status: 500 }
        );
      }
    }

    const { data: entry, error } = await supabase
      .from('entries')
      .insert({
        user_id: user.id,
        journal_text: text || '',
        sleep_hours: sleep_hours ?? null,
        weight: weight ?? null,
        stress_level: stress_level ?? null,
        day_rating: mood ?? null,
        ai_title,
        ai_summary,
        mood: ai_mood,
        severity,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (snippetCount > 0) {
      await supabase
        .from('journal_snippets')
        .delete()
        .eq('user_id', user.id)
        .gte('created_at', start)
        .lt('created_at', end);
    }

    return NextResponse.json({ entry }, { status: 201 });
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
    console.error('Entries POST error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
