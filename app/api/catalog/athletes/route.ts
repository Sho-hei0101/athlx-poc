import {
  deleteCatalogAthlete,
  getCatalogAthletes,
  updateCatalogAthlete,
  upsertCatalogAthlete,
} from '@/lib/server/catalog';
import { clampBasePrice } from '@/lib/pricing/basePrice';
import type { Athlete } from '@/lib/types';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const jsonResponse = (data: Record<string, unknown>, init?: ResponseInit) =>
  NextResponse.json(data, {
    ...init,
    headers: {
      'Cache-Control': 'no-store',
      ...init?.headers,
    },
  });

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

const validateRequiredFields = (payload: Partial<Athlete>) => {
  const symbol = String(payload.symbol ?? '').trim();
  const name = String(payload.name ?? '').trim();
  const sport = String(payload.sport ?? '').trim();
  const category = String(payload.category ?? '').trim();
  const nationality = String(payload.nationality ?? '').trim();
  return { symbol, name, sport, category, nationality };
};

export async function GET() {
  try {
    const athletes = await getCatalogAthletes();
    return jsonResponse({ ok: true, athletes });
  } catch (e) {
    console.error('GET /api/catalog/athletes failed', e);
    // 読めない時もUIが落ちないように空配列で返す
    return jsonResponse({ ok: true, athletes: [], warning: 'catalog_unavailable' });
  }
}

export async function POST(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return jsonResponse({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const incoming = (await req.json()) as Partial<Athlete>;
    if (!incoming || typeof incoming !== 'object') {
      return jsonResponse({ ok: false, error: 'Bad payload' }, { status: 400 });
    }

    const { symbol, name, sport, category, nationality } = validateRequiredFields(incoming);
    if (!symbol || !name || !sport || !category || !nationality) {
      return jsonResponse({ ok: false, error: 'Missing required fields' }, { status: 400 });
    }

    const unitCost = normalizeBasePrice(incoming.unitCost);
    const athleteToSave: Athlete = {
      ...(incoming as Athlete),
      symbol: symbol.toUpperCase(),
      name,
      sport: sport as Athlete['sport'],
      category: category as Athlete['category'],
      nationality,
      unitCost,
      currentPrice: unitCost,
      unitCostOverride: incoming.unitCostOverride ?? false,
    };

    const athletes = await upsertCatalogAthlete(athleteToSave);
    return jsonResponse({ ok: true, athletes });
  } catch (error) {
    console.error('POST /api/catalog/athletes failed', error);
    return jsonResponse({ ok: false, error: 'KV write failed' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return jsonResponse({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const incoming = (await req.json()) as Partial<Athlete>;
    if (!incoming || typeof incoming !== 'object') {
      return jsonResponse({ ok: false, error: 'Bad payload' }, { status: 400 });
    }

    const symbol = String(incoming.symbol ?? '').trim();
    if (!symbol) {
      return jsonResponse({ ok: false, error: 'Missing symbol' }, { status: 400 });
    }

    const { name, sport, category, nationality } = validateRequiredFields(incoming);
    if ((incoming.name !== undefined && !name) ||
        (incoming.sport !== undefined && !sport) ||
        (incoming.category !== undefined && !category) ||
        (incoming.nationality !== undefined && !nationality)) {
      return jsonResponse({ ok: false, error: 'Invalid fields' }, { status: 400 });
    }

    const { nextCatalog, updated } = await updateCatalogAthlete(symbol, incoming);
    if (!updated) {
      return jsonResponse({ ok: false, error: 'Not found' }, { status: 404 });
    }
    return jsonResponse({ ok: true, athletes: nextCatalog });
  } catch (error) {
    console.error('PATCH /api/catalog/athletes failed', error);
    return jsonResponse({ ok: false, error: 'KV update failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return jsonResponse({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const incoming = (await req.json()) as Partial<Athlete>;
    if (!incoming || typeof incoming !== 'object') {
      return jsonResponse({ ok: false, error: 'Bad payload' }, { status: 400 });
    }

    const symbol = String(incoming.symbol ?? '').trim();
    if (!symbol) {
      return jsonResponse({ ok: false, error: 'Missing symbol' }, { status: 400 });
    }

    const athletes = await deleteCatalogAthlete(symbol);
    return jsonResponse({ ok: true, athletes, deleted: symbol.toUpperCase() });
  } catch (error) {
    console.error('DELETE /api/catalog/athletes failed', error);
    return jsonResponse({ ok: false, error: 'KV delete failed' }, { status: 500 });
  }
}
