import { NextResponse } from 'next/server';
import { getSupabaseServerClient, isSupabaseEnvError } from '@/lib/server/supabase';

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

    const supabase = getSupabaseServerClient();

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
      console.error('Supabase analytics insert failed', {
        error,
        eventId,
        type: payload.type,
        athleteSymbol: payload.athleteSymbol ?? null,
        userId: payload.userId ?? null,
      });
      return jsonResponse({ ok: false, error: 'Insert failed' }, { status: 500 });
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    if (isSupabaseEnvError(error)) {
      return jsonResponse(
        { ok: false, error: 'Missing Supabase env', missing: error.missing },
        { status: 500 },
      );
    }

    console.error('Analytics event route error', error);
    return jsonResponse({ ok: false, error: 'Bad request' }, { status: 400 });
  }
}
