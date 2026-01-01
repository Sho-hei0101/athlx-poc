import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const runtime = 'nodejs';

const KV_KEY = 'athlx:catalog:athletes:v1';

type Athlete = Record<string, any>;

/**
 * Vercel Cron 標準: Authorization: Bearer <CRON_SECRET>
 * 手元確認用: x-cron-secret: <CRON_SECRET>
 * 両対応にしておく（ラク＆事故が少ない）
 */
function isCronAuthorized(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;

  // 1) Vercel Cron standard header
  const auth = req.headers.get('authorization') || '';
  if (auth.startsWith('Bearer ')) {
    const token = auth.slice('Bearer '.length).trim();
    if (token && token === expected) return true;
  }

  // 2) Manual curl header
  const provided = req.headers.get('x-cron-secret');
  if (provided && provided === expected) return true;

  return false;
}

export async function POST(req: Request) {
  try {
    if (!isCronAuthorized(req)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const athletes = ((await kv.get<Athlete[]>(KV_KEY)) ?? []).filter(Boolean);

    const now = new Date().toISOString();

    // デモ更新：-1%〜+1%のランダム揺らぎで価格と履歴を更新
    const next = athletes.map((a) => {
      const currentPrice = Number(a.currentPrice ?? a.unitCost ?? 0.01);
      const base = Number.isFinite(currentPrice) && currentPrice > 0 ? currentPrice : 0.01;

      const noise = Math.random() * 0.02 - 0.01; // -0.01 〜 +0.01
      const newPrice = Math.max(0.001, base * (1 + noise));

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

// （任意）動作確認用：ブラウザで叩くと401になるのが正常
export async function GET() {
  return NextResponse.json({ ok: true, hint: 'Use POST with Authorization: Bearer <CRON_SECRET> or x-cron-secret' });
}
