import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const runtime = 'nodejs';

const KV_KEY = 'athlx:catalog:athletes:v1';

type Athlete = Record<string, unknown>; // 型安全はフロント側で担保（APIは柔軟に）

function requireAdminPin(req: Request): string | null {
  const expected = process.env.ADMIN_PIN;
  if (!expected) return null;
  const provided = req.headers.get('x-admin-pin');
  if (!provided) return null;
  return provided === expected ? provided : null;
}

export async function GET() {
  try {
    const athletes = (await kv.get<Athlete[]>(KV_KEY)) ?? null;
    return NextResponse.json({ ok: true, athletes: athletes ?? [] });
  } catch (e) {
    console.error('GET /api/catalog/athletes failed', e);
    return NextResponse.json({ ok: false, error: 'KV read failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Admin PIN check
    const okPin = requireAdminPin(req);
    if (!okPin) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const incoming = (await req.json()) as Athlete;
    if (!incoming || typeof incoming !== 'object') {
      return NextResponse.json({ ok: false, error: 'Bad payload' }, { status: 400 });
    }

    // existing catalog
    const existing = (await kv.get<Athlete[]>(KV_KEY)) ?? [];
    const symbol = String(incoming['symbol'] ?? '').toUpperCase();

    if (!symbol) {
      return NextResponse.json({ ok: false, error: 'Missing symbol' }, { status: 400 });
    }

    const next = (() => {
      const idx = existing.findIndex((a) => String(a?.['symbol'] ?? '').toUpperCase() === symbol);
      if (idx >= 0) {
        const copy = [...existing];
        copy[idx] = incoming;
        return copy;
      }
      return [...existing, incoming];
    })();

    await kv.set(KV_KEY, next);

    return NextResponse.json({ ok: true, athletes: next });
  } catch (e) {
    console.error('POST /api/catalog/athletes failed', e);
    return NextResponse.json({ ok: false, error: 'KV write failed' }, { status: 500 });
  }
}
