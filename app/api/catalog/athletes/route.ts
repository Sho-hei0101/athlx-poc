import { NextResponse } from 'next/server';
import type { Athlete } from '@/lib/types';
import { deleteCatalogAthlete, getCatalogAthletes, updateCatalogAthlete, upsertCatalogAthlete } from '@/lib/server/catalog';

export const runtime = 'nodejs';

const isValidAthletePayload = (payload: unknown): payload is Athlete => {
  if (!payload || typeof payload !== 'object') return false;
  const athlete = payload as Athlete;
  const requiredStrings = [
    athlete.id,
    athlete.name,
    athlete.symbol,
    athlete.sport,
    athlete.category,
    athlete.nationality,
    athlete.team,
    athlete.position,
    athlete.bio,
    athlete.imageUrl,
    athlete.createdAt,
  ];
  if (requiredStrings.some((value) => typeof value !== 'string' || value.length === 0)) {
    return false;
  }
  if (
    (athlete.profileUrl && typeof athlete.profileUrl !== 'string') ||
    (athlete.highlightVideoUrl && typeof athlete.highlightVideoUrl !== 'string')
  ) {
    return false;
  }
  const requiredNumbers = [
    athlete.unitCost,
    athlete.activityIndex,
    athlete.currentPrice,
    athlete.price24hChange,
    athlete.price7dChange,
    athlete.tradingVolume,
    athlete.holders,
  ];
  if (requiredNumbers.some((value) => typeof value !== 'number' || Number.isNaN(value))) {
    return false;
  }
  if (!Array.isArray(athlete.tags) || !Array.isArray(athlete.priceHistory)) {
    return false;
  }
  return true;
};

const isValidPartialPayload = (payload: unknown): payload is Partial<Athlete> => {
  if (!payload || typeof payload !== 'object') return false;
  const athlete = payload as Partial<Athlete>;
  const stringFields: Array<keyof Athlete> = [
    'name',
    'symbol',
    'sport',
    'category',
    'nationality',
    'team',
    'position',
    'bio',
    'profileUrl',
    'highlightVideoUrl',
    'imageUrl',
  ];
  for (const field of stringFields) {
    const value = athlete[field];
    if (value !== undefined && typeof value !== 'string') return false;
  }
  const numberFields: Array<keyof Athlete> = [
    'unitCost',
    'currentPrice',
    'activityIndex',
    'price24hChange',
    'price7dChange',
    'tradingVolume',
    'holders',
    'age',
  ];
  for (const field of numberFields) {
    const value = athlete[field];
    if (value !== undefined && (typeof value !== 'number' || Number.isNaN(value))) return false;
  }
  if (athlete.tags !== undefined && !Array.isArray(athlete.tags)) return false;
  if (athlete.priceHistory !== undefined && !Array.isArray(athlete.priceHistory)) return false;
  return true;
};

export async function GET() {
  try {
    const catalog = await getCatalogAthletes();
    return NextResponse.json({ ok: true, athletes: catalog });
  } catch (error) {
    console.error('Catalog GET failed', error);
    return NextResponse.json({ ok: true, athletes: [], warning: 'catalog_unavailable' });
  }
}

export async function POST(req: Request) {
  try {
    const adminPin = req.headers.get('x-admin-pin');
    if (!adminPin || adminPin !== process.env.ATHLX_ADMIN_PIN) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = (await req.json()) as unknown;
    if (!isValidAthletePayload(payload)) {
      return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
    }

    const newAthlete = {
      ...payload,
      symbol: payload.symbol.toUpperCase(),
    };

    const catalog = await upsertCatalogAthlete(newAthlete);
    return NextResponse.json({ ok: true, athletes: catalog });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Catalog update failed';
    console.error('Catalog POST failed', error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const adminPin = req.headers.get('x-admin-pin');
    if (!adminPin || adminPin !== process.env.ATHLX_ADMIN_PIN) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol');
    if (!symbol) {
      return NextResponse.json({ ok: false, error: 'Missing symbol' }, { status: 400 });
    }

    const payload = (await req.json()) as unknown;
    if (!isValidPartialPayload(payload)) {
      return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
    }

    const catalog = await updateCatalogAthlete(symbol, payload);
    return NextResponse.json({ ok: true, athletes: catalog });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Catalog update failed';
    console.error('Catalog PUT failed', error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const adminPin = req.headers.get('x-admin-pin');
    if (!adminPin || adminPin !== process.env.ATHLX_ADMIN_PIN) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol');
    if (!symbol) {
      return NextResponse.json({ ok: false, error: 'Missing symbol' }, { status: 400 });
    }

    const catalog = await deleteCatalogAthlete(symbol);
    return NextResponse.json({ ok: true, athletes: catalog });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Catalog delete failed';
    console.error('Catalog DELETE failed', error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
