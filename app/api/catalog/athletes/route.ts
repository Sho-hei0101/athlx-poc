import { getCatalogAthletes } from '@/lib/server/catalog';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const athletes = await getCatalogAthletes();
    return NextResponse.json({ ok: true, athletes });
  } catch (e) {
    console.error('GET /api/catalog/athletes failed', e);
    // 読めない時もUIが落ちないように空配列で返す
    return NextResponse.json({ ok: true, athletes: [], warning: 'catalog_unavailable' });
  }
}
