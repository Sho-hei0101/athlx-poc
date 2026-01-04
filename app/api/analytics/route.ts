import { NextResponse } from 'next/server';
import { getSupabaseServerClient, isSupabaseEnvError } from '@/lib/server/supabase';

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

    const supabase = getSupabaseServerClient();

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
      console.error('Supabase analytics insert failed', {
        error,
        eventId,
        type: payload.type,
        athleteSymbol: payload.athleteSymbol ?? null,
        userId: payload.userId ?? null,
      });
      return NextResponse.json({ ok: false, error: 'Insert failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isSupabaseEnvError(error)) {
      return NextResponse.json(
        { ok: false, error: 'Missing Supabase env', missing: error.missing },
        { status: 500 },
      );
    }

    console.error('Analytics route error', error);
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  }
}
