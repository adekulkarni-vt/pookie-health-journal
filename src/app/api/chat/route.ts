import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { requireUser } from '@/lib/auth';
import { requireWhitelist } from '@/lib/whitelist';
import { createServiceClient } from '@/lib/supabase/service';
import { SYSTEM_PROMPTS } from '@/gemini/prompts';

const isDev = process.env.NODE_ENV === 'development';

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

function formatEntry(e: { created_at: string; ai_title: string | null; ai_summary: string | null; mood: string | null; severity: number | null }): string {
  const date = formatShortDate(e.created_at);
  const parts = [`[${date}]`];
  if (e.ai_title) parts.push(e.ai_title);
  if (e.ai_summary) parts.push(`Summary: ${e.ai_summary}`);
  const meta = [];
  if (e.mood) meta.push(`Mood: ${e.mood}`);
  if (e.severity != null) meta.push(`Severity: ${e.severity}`);
  if (meta.length) parts.push(meta.join(' | '));
  return parts.join('\n');
}

const encoder = new TextEncoder();

interface EntryResult {
  formatted: string;
  entries: { created_at: string; ai_title: string | null; ai_summary: string | null; mood: string | null; severity: number | null }[];
}

async function queryEntries(userId: string, hasDateRef: boolean, startDate: string | null, endDate: string): Promise<EntryResult> {
  const supabase = createServiceClient();

  let entries: EntryResult['entries'] = [];

  if (hasDateRef && startDate) {
    const { data } = await supabase
      .from('entries')
      .select('created_at, ai_title, ai_summary, mood, severity')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', `${endDate}T23:59:59Z`)
      .order('created_at', { ascending: false });

    entries = data ?? [];
  } else {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const defaultStart = sevenDaysAgo.toISOString().split('T')[0];

    const { data } = await supabase
      .from('entries')
      .select('created_at, ai_title, ai_summary, mood, severity')
      .eq('user_id', userId)
      .gte('created_at', defaultStart)
      .order('created_at', { ascending: false })
      .limit(10);

    entries = data ?? [];
  }

  if (entries.length === 0) {
    return { formatted: 'No journal entries found for the relevant period.\n\n', entries: [] };
  }

  const sorted = [...entries].sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const earliest = formatShortDate(sorted[0].created_at);
  const latest = formatShortDate(sorted[sorted.length - 1].created_at);

  const metadata = `Journal Dataset:\n* Total Entries: ${entries.length}\n* Date Range: ${earliest} -> ${latest}\n\n`;
  const body = entries.map(formatEntry).join('\n\n');

  return { formatted: metadata + body + '\n\n', entries };
}

function buildPrompt(
  message: string,
  messages: unknown[],
  entryResult: EntryResult,
): string {
  const now = new Date().toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: 'numeric', minute: 'numeric',
  });

  const historyText = (messages as { role: string; content: string }[] ?? [])
    .slice(-6)
    .map((m) => (m.role === 'user' ? `User: ${m.content}` : `Assistant: ${m.content}`))
    .join('\n');

  const parts: string[] = [];
  parts.push(`Current date and time: ${now}`);
  parts.push('');
  parts.push('You have access to the user\'s journal history below.');
  parts.push('');

  if (entryResult.entries.length > 0) {
    parts.push('When answering:');
    parts.push('* Base answers only on journal entries provided.');
    parts.push('* Reference specific entries when relevant.');
    parts.push('* Explain what evidence supports your conclusions.');
    parts.push('* If information is insufficient, say so clearly.');
    parts.push('* Never invent details.');
    parts.push('* Do not provide medical diagnoses.');
    parts.push('');
  }

  parts.push('Journal Entries:');
  parts.push(entryResult.formatted);

  if (historyText) {
    parts.push('Conversation History:');
    parts.push(historyText);
    parts.push('');
  }

  parts.push(`User Question:\n${message}`);

  return parts.join('\n');
}

async function tryGeminiStream(apiKey: string, systemInstruction: string, prompt: string): Promise<AsyncIterable<string>> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
    systemInstruction,
  });
  const result = await model.generateContentStream(prompt);
  return {
    [Symbol.asyncIterator]: () => {
      const iterator = result.stream[Symbol.asyncIterator]();
      return {
        async next() {
          const chunk = await iterator.next();
          if (chunk.done) return { done: true, value: undefined as unknown as string };
          return { done: false, value: chunk.value.text() ?? '' };
        },
      };
    },
  };
}

export async function POST(request: NextRequest) {
  const retrievalStart = Date.now();

  try {
    const user = await requireUser();
    if (user.email) await requireWhitelist(user.email);

    const { message, messages } = await request.json();

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Step 1: Extract date range
    const { hasDateRef, startDate, endDate } = await extractDateRange(message, apiKey);

    // Step 2: Query Supabase for entries + metadata
    const entryResult = await queryEntries(user.id, hasDateRef, startDate, endDate);
    const retrievalMs = Date.now() - retrievalStart;

    const earliestDate = entryResult.entries.length > 0
      ? formatShortDate(
          [...entryResult.entries].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )[0].created_at
        )
      : null;
    const latestDate = entryResult.entries.length > 0
      ? formatShortDate(
          [...entryResult.entries].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0].created_at
        )
      : null;

    // Step 3: Build the full prompt
    const fullPrompt = buildPrompt(message, messages, entryResult);

    const contextChars = entryResult.formatted.length;
    const promptChars = fullPrompt.length;
    const estimatedTokens = Math.ceil(promptChars / 4);

    // Step 4: Telemetry
    const telemetry: Record<string, unknown> = {
      question: message,
      entriesRetrieved: entryResult.entries.length,
      earliestDate,
      latestDate,
      contextChars,
      promptChars,
      estimatedTokens,
      model: 'gemini-2.5-flash-lite',
      retrievalMs,
    };

    if (isDev) {
      console.log('\n=== CHAT TELEMETRY ===');
      console.log(JSON.stringify(telemetry, null, 2));
      console.log('\n=== SYSTEM PROMPT ===');
      console.log(SYSTEM_PROMPTS.healthInsights);
      console.log('\n=== USER QUESTION ===');
      console.log(message);
      console.log('\n=== RETRIEVED ENTRY DATES ===');
      entryResult.entries.forEach((e) => console.log(`  ${formatShortDate(e.created_at)}`));
      console.log('\n=== FULL PROMPT ===');
      console.log(fullPrompt);
      console.log('\n======================\n');
    } else {
      console.log(`[Chat] ${JSON.stringify(telemetry)}`);
    }

    // Step 5: Stream from Gemini
    const llmStart = Date.now();
    const stream = await tryGeminiStream(apiKey, SYSTEM_PROMPTS.healthInsights, fullPrompt);
    let firstToken = true;

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const token of stream) {
            if (firstToken) {
              telemetry.llmMs = Date.now() - llmStart;
              if (!isDev) {
                console.log(`[Chat] ${JSON.stringify({ ...telemetry, event: 'first_token' })}`);
              }
              firstToken = false;
            }
            controller.enqueue(encoder.encode(token));
          }
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : 'Stream error';
          console.error('Stream iteration error:', errMsg);
        } finally {
          if (firstToken) {
            telemetry.llmMs = Date.now() - llmStart;
          }
          telemetry.totalMs = Date.now() - retrievalStart;
          if (!isDev) {
            console.log(`[Chat] ${JSON.stringify(telemetry)}`);
          }
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized: User not authenticated') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (error instanceof Error && error.message === 'Whitelist access denied') {
      return new Response(JSON.stringify({ error: 'Access not enabled for this account.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Chat API error:', errMsg);
    return new Response(JSON.stringify({ error: errMsg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function extractDateRange(message: string, geminiApiKey: string): Promise<{ hasDateRef: boolean; startDate: string | null; endDate: string }> {
  try {
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    const today = getTodayISO();

    const prompt = `Given this question from a health journal user, identify if they are asking about a specific time period.

Return ONLY valid JSON with this exact structure (no markdown, no code fences):
{
  "has_date_reference": false,
  "start_date": null,
  "end_date": null
}

- has_date_reference: true if the question mentions a date, day, week, month, or time period
- start_date: the start of the mentioned period in YYYY-MM-DD format
- end_date: the end of the mentioned period in YYYY-MM-DD format (defaults to today if not specified)

Examples:
"what did I eat last week" → {"has_date_reference": true, "start_date": "2026-06-14", "end_date": "2026-06-21"}
"how was my stress this month" → {"has_date_reference": true, "start_date": "2026-06-01", "end_date": "2026-06-21"}
"tell me about my health" → {"has_date_reference": false, "start_date": null, "end_date": null}

Today's date is ${today}.

Question: ${message}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const braceStart = cleaned.indexOf('{');
    const braceEnd = cleaned.lastIndexOf('}');
    const json = braceStart !== -1 && braceEnd !== -1 ? cleaned.slice(braceStart, braceEnd + 1) : cleaned;
    const parsed = JSON.parse(json);

    return {
      hasDateRef: parsed.has_date_reference === true,
      startDate: parsed.start_date ?? null,
      endDate: parsed.end_date ?? today,
    };
  } catch {
    return { hasDateRef: false, startDate: null, endDate: getTodayISO() };
  }
}
