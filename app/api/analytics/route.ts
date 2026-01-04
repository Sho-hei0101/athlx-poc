import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resolveSupabaseServerEnv } from '@/lib/server/supabase';

export const runtime = 'nodejs';

type AnalyticsPayload = {
  id?: string;
  type: string;
  at?: string;
  userId?: string;
  athleteSymbol?: string;
  meta?: Record<string, unknown>;
};

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as AnalyticsPayload;

    if (!payload?.type) {
      return NextResponse.json({ ok: false, error: 'Missing type' }, { status: 400 });
    }

    const { url, serviceKey, missing } = resolveSupabaseServerEnv();
    if (!url || !serviceKey) {
      console.error('Supabase env vars missing for analytics insert', { missing });
      return NextResponse.json({ ok: false, error: 'Missing Supabase env' }, { status: 500 });
    }

    const supabase = createClient(url, serviceKey);

    const eventId = payload.id ?? crypto.randomUUID();
    const eventAt = payload.at ?? new Date().toISOString();

    // IMPORTANT: analytics_events に user_id カラムが無い前提なので meta に埋める
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
      return NextResponse.json({ ok: false, error: 'Insert failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Analytics route error', e);
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  }
}
