import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const runtime = 'nodejs';

const KV_KEY = 'athlx:catalog:athletes:v1';

type Athlete = Record<string, any>;

function isCronAuthorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const auth = req.headers.get('authorization') || '';
  // Vercel Cron: Authorization: Bearer <CRON_SECRET>
  return auth === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  // CronはGETで叩く想定（Vercel Cron）
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const athletes = (await kv.get<Athlete[]>(KV_KEY)) ?? [];
    const list = Array.isArray(athletes) ? athletes : [];

    const now = new Date().toISOString();

    const next = list.map((a) => {
      const unitCost = Number(a.unitCost ?? a.currentPrice ?? 0.01);
      const currentPrice = Number(a.currentPrice ?? unitCost);

      // 小さなランダムウォーク（±0.5%程度）
      const drift = (Math.random() * 0.01 - 0.005); // -0.5% ~ +0.5%
      const newPrice = Math.max(0.001, Number((currentPrice * (1 + drift)).toFixed(6)));

      const priceHistory = Array.isArray(a.priceHistory) ? a.priceHistory : [];
      const newPoint = { time: now, price: newPrice, volume: Math.floor(Math.random() * 5000) };

      // 履歴肥大化防止：最大200点に制限
      const trimmed = [...priceHistory, newPoint].slice(-200);

      // 24h/7d は「デモの見た目」用に簡易更新（厳密でなくてOK）
      const base24h = trimmed.length > 24 ? Number(trimmed[Math.max(0, trimmed.length - 24)]?.price ?? newPrice) : newPrice;
      const base7d = trimmed.length > 168 ? Number(trimmed[Math.max(0, trimmed.length - 168)]?.price ?? newPrice) : newPrice;

      const price24hChange = base24h ? ((newPrice - base24h) / base24h) * 100 : 0;
      const price7dChange = base7d ? ((newPrice - base7d) / base7d) * 100 : 0;

      return {
        ...a,
        currentPrice: newPrice,
        unitCost: newPrice,
        price24hChange,
        price7dChange,
        priceHistory: trimmed,
        lastUpdateReason: a.lastUpdateReason ?? 'Auto tick (demo)',
      };
    });

    await kv.set(KV_KEY, next);

    return NextResponse.json({ ok: true, count: next.length, at: now });
  } catch (e) {
    console.error('cron tick failed', e);
    return NextResponse.json({ ok: false, error: 'Cron tick failed' }, { status: 500 });
  }
}
