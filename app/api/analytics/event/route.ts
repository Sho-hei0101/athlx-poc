import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resolveSupabaseServerEnv } from '@/lib/server/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type AnalyticsPayload = {
  id?: string;
  type: string;
  at?: string;
  userId?: string;
  athleteSymbol?: string;
  meta?: Record<string, unknown>;
};

const jsonResponse = (data: Record<string, unknown>, init?: ResponseInit) =>
  NextResponse.json(data, {
    ...init,
    headers: {
      'Cache-Control': 'no-store',
      ...init?.headers,
    },
  });

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as AnalyticsPayload;

    if (!payload?.type) {
      return jsonResponse({ ok: false, error: 'Missing type' }, { status: 400 });
    }

    const { url, serviceKey, missing } = resolveSupabaseServerEnv();
    if (!url || !serviceKey) {
      console.error('Supabase env vars missing for analytics insert', { missing });
      return jsonResponse({ ok: false, error: 'Missing Supabase env' }, { status: 500 });
    }

    const supabase = createClient(url, serviceKey);

    const eventId = payload.id ?? crypto.randomUUID();
    const eventAt = payload.at ?? new Date().toISOString();

    const meta =
      payload.userId ? { ...(payload.meta ?? {}), userId: payload.userId } : payload.meta ?? null;

    const { error } = await supabase.from('analytics_events').insert({
      id: eventId,
      type: payload.type,
      at: eventAt,
      athlete_symbol: payload.athleteSymbol ?? null,
      meta,
    });

    if (error) {
      console.error('Supabase analytics insert failed', error);
      return jsonResponse({ ok: false, error: 'Insert failed' }, { status: 500 });
    }

    return jsonResponse({ ok: true });
  } catch (e) {
    console.error('Analytics event route error', e);
    return jsonResponse({ ok: false, error: 'Bad request' }, { status: 400 });
  }
}
