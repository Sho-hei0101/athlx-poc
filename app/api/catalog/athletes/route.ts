import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const runtime = 'nodejs';

const KV_KEY = 'athlx:catalog:athletes:v1';

// APIは柔軟に受け、型安全はフロント側で担保
type Athlete = Record<string, unknown>;

function isAuthorized(req: Request): boolean {
  const expected = process.env.ATHLX_ADMIN_PIN;
  if (!expected) return false;
  const provided = req.headers.get('x-admin-pin');
  if (!provided) return false;
  return provided === expected;
}

export async function GET() {
  try {
    const athletes = (await kv.get<Athlete[]>(KV_KEY)) ?? [];
    return NextResponse.json({ ok: true, athletes: Array.isArray(athletes) ? athletes : [] });
  } catch (e) {
    console.error('GET /api/catalog/athletes failed', e);
    // 読めない時もUIが落ちないように空配列で返す
    return NextResponse.json({ ok: true, athletes: [], warning: 'catalog_unavailable' });
  }
}

export async function POST(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const incoming = (await req.json()) as Athlete;
    if (!incoming || typeof incoming !== 'object') {
      return NextResponse.json({ ok: false, error: 'Bad payload' }, { status: 400 });
    }

    const symbol = String(incoming['symbol'] ?? '').toUpperCase().trim();
    if (!symbol) {
      return NextResponse.json({ ok: false, error: 'Missing symbol' }, { status: 400 });
    }

    // symbolは常に大文字に正規化して保存
    const athleteToSave: Athlete = { ...incoming, symbol };

    const existing = (await kv.get<Athlete[]>(KV_KEY)) ?? [];
    const list = Array.isArray(existing) ? existing : [];

    const idx = list.findIndex((a) => String(a?.['symbol'] ?? '').toUpperCase() === symbol);
    const next = idx >= 0 ? list.map((a, i) => (i === idx ? athleteToSave : a)) : [...list, athleteToSave];

    await kv.set(KV_KEY, next);

    return NextResponse.json({ ok: true, athletes: next });
  } catch (e) {
    console.error('POST /api/catalog/athletes failed', e);
    return NextResponse.json({ ok: false, error: 'KV write failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let symbol = String(searchParams.get('symbol') ?? '').toUpperCase().trim();
    if (!symbol) {
      try {
        const body = (await req.json()) as { symbol?: string };
        symbol = String(body?.symbol ?? '').toUpperCase().trim();
      } catch {
        // ignore malformed body
      }
    }
    if (!symbol) {
      return NextResponse.json({ ok: false, error: 'Missing symbol' }, { status: 400 });
    }

    const existing = (await kv.get<Athlete[]>(KV_KEY)) ?? [];
    const list = Array.isArray(existing) ? existing : [];

    const next = list.filter((a) => String(a?.['symbol'] ?? '').toUpperCase() !== symbol);

    await kv.set(KV_KEY, next);
    return NextResponse.json({ ok: true, athletes: next, deleted: symbol });
  } catch (e) {
    console.error('DELETE /api/catalog/athletes failed', e);
    return NextResponse.json({ ok: false, error: 'KV delete failed' }, { status: 500 });
  }
}
