import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import type { Athlete } from '@/lib/types';
import { getCatalogAthletes, KV_KEY } from '@/lib/server/catalog';

export const runtime = 'nodejs';

const normalizeBasePrice = (value: unknown) => {
  const numeric = typeof value === 'number' && Number.isFinite(value) ? value : 0.01;
  return Math.min(0.02, Math.max(0.001, numeric));
};

const isAuthorized = (req: Request) => {
  const expected = process.env.ATHLX_ADMIN_PIN ?? process.env.NEXT_PUBLIC_ADMIN_PIN;
  if (!expected) return true;
  const provided = req.headers.get('x-admin-pin');
  return Boolean(provided && provided === expected);
};

export async function PATCH(req: Request, context: { params: { symbol: string } }) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const symbol = String(context.params.symbol ?? '').toUpperCase().trim();
    if (!symbol) {
      return NextResponse.json({ ok: false, error: 'Missing symbol' }, { status: 400 });
    }

    const patch = (await req.json()) as Partial<Athlete>;
    if (!patch || typeof patch !== 'object') {
      return NextResponse.json({ ok: false, error: 'Bad payload' }, { status: 400 });
    }

    const existing = await getCatalogAthletes();
    const index = existing.findIndex((athlete) => athlete.symbol.toUpperCase() === symbol);
    if (index < 0) {
      return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    }

    const current = existing[index];
    const nextUnitCost = normalizeBasePrice(patch.unitCost ?? current.unitCost);
    const nextAthlete: Athlete = {
      ...current,
      ...patch,
      symbol: current.symbol,
      unitCost: nextUnitCost,
      currentPrice: nextUnitCost,
    };

    const next = existing.map((athlete, idx) => (idx === index ? nextAthlete : athlete));
    await kv.set(KV_KEY, next);
    return NextResponse.json({ ok: true, athletes: next });
  } catch (error) {
    console.error('PATCH /api/admin/athletes failed', error);
    return NextResponse.json({ ok: false, error: 'KV update failed' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: { params: { symbol: string } }) {
  try {
    if (!_req) {
      return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
    }
    if (!isAuthorized(_req)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const symbol = String(context.params.symbol ?? '').toUpperCase().trim();
    if (!symbol) {
      return NextResponse.json({ ok: false, error: 'Missing symbol' }, { status: 400 });
    }

    const existing = await getCatalogAthletes();
    const next = existing.filter((athlete) => athlete.symbol.toUpperCase() !== symbol);

    await kv.set(KV_KEY, next);
    return NextResponse.json({ ok: true, athletes: next, deleted: symbol });
  } catch (error) {
    console.error('DELETE /api/admin/athletes failed', error);
    return NextResponse.json({ ok: false, error: 'KV delete failed' }, { status: 500 });
  }
}
