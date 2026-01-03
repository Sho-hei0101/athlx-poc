import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const KV_KEY = 'fees:ops3:total_tathlx';

const jsonResponse = (data: Record<string, unknown>, init?: ResponseInit) =>
  NextResponse.json(data, {
    ...init,
    headers: {
      'Cache-Control': 'no-store',
      ...init?.headers,
    },
  });

const getTotal = async () => {
  const current = await kv.get<number>(KV_KEY);
  return typeof current === 'number' && Number.isFinite(current) ? current : 0;
};

export async function GET() {
  try {
    const total = await getTotal();
    return jsonResponse({ ok: true, total });
  } catch (error) {
    console.error('GET /api/fees/ops3 failed', error);
    return jsonResponse({ ok: false, error: 'KV read failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as { delta?: number };
    const delta = typeof payload?.delta === 'number' ? payload.delta : NaN;
    if (!Number.isFinite(delta) || delta < 0) {
      return jsonResponse({ ok: false, error: 'Invalid delta' }, { status: 400 });
    }

    const current = await getTotal();
    const nextTotal = current + delta;
    await kv.set(KV_KEY, nextTotal);

    return jsonResponse({ ok: true, total: nextTotal });
  } catch (error) {
    console.error('POST /api/fees/ops3 failed', error);
    return jsonResponse({ ok: false, error: 'KV write failed' }, { status: 500 });
  }
}
