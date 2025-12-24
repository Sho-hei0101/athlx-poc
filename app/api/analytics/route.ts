import { NextRequest, NextResponse } from 'next/server';

type AnalyticsPayload = {
  id?: string;
  type: string;
  at?: string;
  userId?: string;
  athleteSymbol?: string;
  meta?: Record<string, unknown>;
};

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as AnalyticsPayload;
    if (!payload?.type) {
      return NextResponse.json({ ok: false, error: 'Missing type' }, { status: 400 });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Supabase env vars missing for analytics insert');
      return NextResponse.json({ ok: false, error: 'Server misconfiguration' }, { status: 500 });
    }

    const eventId = payload.id ?? crypto.randomUUID();
    const eventAt = payload.at ?? new Date().toISOString();
    const insertPayload = {
      id: eventId,
      type: payload.type,
      at: eventAt,
      user_id: payload.userId ?? null,
      athlete_symbol: payload.athleteSymbol ?? null,
      meta: payload.meta ?? null
    };

    const response = await fetch(`${supabaseUrl}/rest/v1/analytics_events`, {
      method: 'POST',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(insertPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase analytics insert failed', response.status, errorText);
      return NextResponse.json({ ok: false, error: 'Insert failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Analytics route error', error);
    return NextResponse.json({ ok: false, error: 'Unexpected error' }, { status: 500 });
  }
}
