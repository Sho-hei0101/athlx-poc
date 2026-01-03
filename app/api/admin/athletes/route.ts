import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import type { Athlete } from '@/lib/types';
import { getCatalogAthletes, KV_KEY } from '@/lib/server/catalog';
import { clampBasePrice } from '@/lib/pricing/basePrice';

export const runtime = 'nodejs';

const normalizeBasePrice = (value: unknown) => {
  const numeric = typeof value === 'number' && Number.isFinite(value) ? value : 0.01;
  return clampBasePrice(numeric);
};

const isAuthorized = (req: Request) => {
  const expected = process.env.ATHLX_ADMIN_PIN ?? process.env.NEXT_PUBLIC_ADMIN_PIN;
  if (!expected) return true;
  const provided = req.headers.get('x-admin-pin');
  return Boolean(provided && provided === expected);
};

export async function POST(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const incoming = (await req.json()) as Athlete;
    if (!incoming || typeof incoming !== 'object') {
      return NextResponse.json({ ok: false, error: 'Bad payload' }, { status: 400 });
    }

    const symbol = String(incoming.symbol ?? '').toUpperCase().trim();
    if (!symbol) {
      return NextResponse.json({ ok: false, error: 'Missing symbol' }, { status: 400 });
    }

    const unitCost = normalizeBasePrice(incoming.unitCost);
    const athleteToSave: Athlete = {
      ...incoming,
      symbol,
      unitCost,
      currentPrice: unitCost,
      unitCostOverride: incoming.unitCostOverride ?? false,
    };

    const existing = await getCatalogAthletes();
    const next = existing.some((athlete) => athlete.symbol.toUpperCase() === symbol)
      ? existing.map((athlete) => (athlete.symbol.toUpperCase() === symbol ? athleteToSave : athlete))
      : [...existing, athleteToSave];

    await kv.set(KV_KEY, next);
    return NextResponse.json({ ok: true, athletes: next });
  } catch (error) {
    console.error('POST /api/admin/athletes failed', error);
    return NextResponse.json({ ok: false, error: 'KV write failed' }, { status: 500 });
  }
}
