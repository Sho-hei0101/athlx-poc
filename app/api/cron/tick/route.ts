import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

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
    return NextResponse.json({
      ok: true,
      disabled: true,
      message: 'Pseudo-market pricing is generated deterministically on the client.',
    });
  } catch (e) {
    console.error('cron tick failed', e);
    return NextResponse.json({ ok: false, error: 'Cron tick failed' }, { status: 500 });
  }
}
