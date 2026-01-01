import { NextResponse } from 'next/server';
import { initialAthletes } from '@/lib/data';
import type { Athlete } from '@/lib/types';
import { appendCatalogAthlete, getCatalogAthletes } from '@/lib/server/catalog';

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

export async function GET() {
  try {
    const catalog = await getCatalogAthletes();
    const athletes = catalog.length > 0 ? catalog : (initialAthletes as Athlete[]);
    return NextResponse.json({ ok: true, athletes });
  } catch (error) {
    console.error('Catalog GET failed', error);
    return NextResponse.json({ ok: true, athletes: initialAthletes, warning: 'catalog_unavailable' });
  }
}

export async function POST(req: Request) {
  try {
    const adminPin = req.headers.get('x-admin-pin');
    if (!adminPin || adminPin !== process.env.ADMIN_PIN) {
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

    await appendCatalogAthlete(newAthlete);
    const catalog = await getCatalogAthletes();
    return NextResponse.json({ ok: true, athletes: catalog });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Catalog update failed';
    const status = message.includes('exists') ? 409 : 500;
    console.error('Catalog POST failed', error);
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
