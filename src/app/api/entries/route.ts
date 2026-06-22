import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { requireWhitelist } from '@/lib/whitelist';
import { createServiceClient } from '@/lib/supabase/service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { JOURNAL_AND_INSIGHT_PROMPT } from '@/gemini/prompts';
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
      .order('entry_date', { ascending: false });

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

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    if (user.email) await requireWhitelist(user.email);
    const supabase = createServiceClient();

    const body = await request.json();
    const { text, sleep_hours, weight, stress_level, mood, entry_date } = body;

    if (!text && sleep_hours == null && weight == null && stress_level == null && mood == null) {
      return NextResponse.json(
        { error: 'At least one field is required' },
        { status: 400 }
      );
    }

    const journalDate = entry_date || new Date().toISOString().split('T')[0];

    // Fetch snippets for the journal's date
    const snippetStart = `${journalDate}T00:00:00Z`;
    const snippetEnd = `${journalDate}T23:59:59Z`;

    const { data: snippets } = await supabase
      .from('journal_snippets')
      .select('content, created_at')
      .eq('user_id', user.id)
      .gte('created_at', snippetStart)
      .lte('created_at', snippetEnd)
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

    // Check for existing entry on this date
    const { data: existingEntry } = await supabase
      .from('entries')
      .select('id, journal_text, sleep_hours, weight, stress_level, day_rating')
      .eq('user_id', user.id)
      .eq('entry_date', journalDate)
      .maybeSingle();

    const isUpdate = !!existingEntry;

    // Merge journal_text if updating
    let mergedText = text || '';
    if (isUpdate && existingEntry.journal_text) {
      if (text) {
        mergedText = existingEntry.journal_text + '\n\n---\n\n' + text;
      } else {
        mergedText = existingEntry.journal_text;
      }
    }

    // Resolve field values: new values override, existing values used as defaults
    const finalSleep = sleep_hours ?? (isUpdate ? existingEntry.sleep_hours : null);
    const finalWeight = weight ?? (isUpdate ? existingEntry.weight : null);
    const finalStress = stress_level ?? (isUpdate ? existingEntry.stress_level : null);
    const finalMood = mood ?? (isUpdate ? existingEntry.day_rating : null);

    let ai_title: string | null = null;
    let ai_summary: string | null = null;
    let ai_mood: Mood | null = null;
    let severity: number | null = null;
    let dashboardInsight: string | null = null;

    if (mergedText) {
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
        journal_text: mergedText,
        sleep_hours: finalSleep,
        weight: finalWeight,
        stress_level: finalStress,
        day_rating: finalMood,
        quick_notes: quickNotesBlock || undefined,
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
        dashboardInsight = typeof parsed.dashboard_insight === 'string' ? parsed.dashboard_insight : null;
        console.log(`[Entries POST] Gemini result: title="${ai_title}" mood=${ai_mood} severity=${severity} summary_len=${(ai_summary ?? '').length} insight_len=${(dashboardInsight ?? '').length}`);
      } catch (geminiError: unknown) {
        const message = geminiError instanceof Error ? geminiError.message : String(geminiError);
        console.error('Gemini memory generation error:', message);
        return NextResponse.json(
          { error: `AI processing failed: ${message}` },
          { status: 500 }
        );
      }
    }

    const entryData = {
      user_id: user.id,
      entry_date: journalDate,
      journal_text: mergedText || '',
      sleep_hours: finalSleep,
      weight: finalWeight,
      stress_level: finalStress,
      day_rating: finalMood,
      ai_title,
      ai_summary,
      mood: ai_mood,
      severity,
    };

    let entry;
    if (isUpdate) {
      const { data, error } = await supabase
        .from('entries')
        .update(entryData)
        .eq('id', existingEntry.id)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      entry = data;
    } else {
      const { data, error } = await supabase
        .from('entries')
        .insert(entryData)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      entry = data;
    }

    if (snippetCount > 0) {
      await supabase
        .from('journal_snippets')
        .delete()
        .eq('user_id', user.id)
        .gte('created_at', snippetStart)
        .lte('created_at', snippetEnd);
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
          source_entry_date: journalDate,
        });
    }

    return NextResponse.json({ entry, isUpdate }, { status: isUpdate ? 200 : 201 });
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
