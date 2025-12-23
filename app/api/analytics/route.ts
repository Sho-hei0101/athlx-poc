import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

type Payload = {
  id: string;
  type: string;
  at: string;
  athleteSymbol?: string;
  meta?: Record<string, unknown>;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload;

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json({ ok: false, error: 'Missing Supabase env' }, { status: 500 });
    }

    const supabase = createClient(url, key);

    const { error } = await supabase.from('analytics_events').insert({
      id: body.id,
      type: body.type,
      at: body.at,
      athlete_symbol: body.athleteSymbol ?? null,
      meta: body.meta ?? null
    });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  }
}
