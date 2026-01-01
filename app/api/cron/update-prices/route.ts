import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const runtime = 'nodejs';

const KV_KEY = 'athlx:catalog:athletes:v1';

function isCronAuthorized(req: Request) {
  const expected = process.env.CRON_SECRET;
  const provided = req.headers.get('x-cron-secret');
  return Boolean(expected && provided && provided === expected);
}

type Athlete = Record<string, any>;

export async function POST(req: Request) {
  try {
    if (!isCronAuthorized(req)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const athletes = ((await kv.get<Athlete[]>(KV_KEY)) ?? []).filter(Boolean);

    // 例：単純に「価格履歴に1点追加」するだけのデモ更新（あなたのロジックに置き換え可能）
    const now = new Date().toISOString();

    const next = athletes.map((a) => {
      const currentPrice = Number(a.currentPrice ?? a.unitCost ?? 0.01);
      const noise = (Math.random() * 0.02 - 0.01); // -1% 〜 +1% のゆらぎ例
      const newPrice = Math.max(0.001, currentPrice * (1 + noise));

      const priceHistory = Array.isArray(a.priceHistory) ? a.priceHistory : [];
      return {
        ...a,
        currentPrice: newPrice,
        unitCost: newPrice,
        priceHistory: [...priceHistory, { time: now, price: newPrice, volume: 0 }],
      };
    });

    await kv.set(KV_KEY, next);

    return NextResponse.json({ ok: true, updated: next.length });
  } catch (e) {
    console.error('cron update failed', e);
    return NextResponse.json({ ok: false, error: 'Cron update failed' }, { status: 500 });
  }
}
