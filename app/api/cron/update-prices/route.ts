import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function extractBearerToken(req: Request): string | null {
  // Web標準では headers.get はケース非依存だが、念のため両方試す
  const raw =
    req.headers.get('authorization') ??
    req.headers.get('Authorization') ??
    '';

  if (!raw) return null;

  // "Bearer <token>" を大文字小文字無視で処理
  const m = raw.match(/^Bearer\s+(.+)$/i);
  if (!m) return null;

  const token = (m[1] ?? '').trim();
  return token.length > 0 ? token : null;
}

function isCronAuthorized(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) return { ok: false as const, reason: 'missing_env' as const };

  // 1) Vercel Cron 標準: Authorization: Bearer <secret>
  const bearer = extractBearerToken(req);
  if (bearer && bearer === expected) return { ok: true as const, via: 'bearer' as const };

  // 2) 手元確認用: x-cron-secret
  const x = req.headers.get('x-cron-secret');
  if (x && x === expected) return { ok: true as const, via: 'x-cron-secret' as const };

  // デバッグ用：Authorizationがそもそも届いているか判定
  const hasAuthHeader =
    Boolean(req.headers.get('authorization')) ||
    Boolean(req.headers.get('Authorization'));

  return { ok: false as const, reason: 'unauthorized' as const, hasAuthHeader, hasXHeader: Boolean(x) };
}

export async function POST(req: Request) {
  try {
    const auth = isCronAuthorized(req);
    if (!auth.ok) {
      // ここで「Authorizationが届いてるか」を返す（超重要）
      return NextResponse.json(
        { ok: false, error: 'Unauthorized', debug: auth },
        { status: 401 },
      );
    }
    return NextResponse.json({
      ok: true,
      disabled: true,
      auth: { via: auth.via },
      message: 'Pseudo-market pricing is generated deterministically on the client.',
    });
  } catch (e) {
    console.error('cron update failed', e);
    return NextResponse.json({ ok: false, error: 'Cron update failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    hint: 'Use POST with Authorization: Bearer <CRON_SECRET> or x-cron-secret',
  });
}
