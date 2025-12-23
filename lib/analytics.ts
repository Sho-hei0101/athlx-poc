import { getBrowserStorage, readJSON, writeJSON } from './storage';

export const EVENTS_KEY = 'athlx_events';

export type AnalyticsEventType =
  | 'login'
  | 'signup'
  | 'trade_buy'
  | 'trade_sell'
  | 'athlete_register_submit'
  | 'athlete_update_submit'
  | 'admin_approve'
  | 'admin_reject'
  | 'export'
  | 'import'
  | 'reset';

export type AnalyticsEvent = {
  id: string;
  type: AnalyticsEventType;
  at: string;
  userId?: string;
  athleteSymbol?: string;
  meta?: Record<string, unknown>;
};

// Analytics events are stored locally (localStorage) and mirrored to Supabase when available.

const createEventId = () => `evt_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;

const lastEventByKey = new Map<string, number>();
const THROTTLE_MS = 500;

const getSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
};

const insertSupabaseEvent = async (event: AnalyticsEvent) => {
  const config = getSupabaseConfig();
  if (!config) return;

  // NOTE:
  // - We intentionally use REST here to avoid importing a Supabase client into a shared module.
  // - Requires a public table "analytics_events" with columns:
  //   id (text), type (text), at (timestamptz), user_id (text), athlete_symbol (text), meta (jsonb)
  try {
    await fetch(`${config.url}/rest/v1/analytics_events`, {
      method: 'POST',
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        id: event.id,
        type: event.type,
        at: event.at,
        user_id: event.userId ?? null,
        athlete_symbol: event.athleteSymbol ?? null,
        meta: event.meta ?? null,
      }),
    });
  } catch (error) {
    // analytics insert should never break the app
    console.error('Failed to insert analytics event into Supabase', error);
  }
};

/**
 * Client-side analytics:
 * - SSR safe
 * - Never breaks app flow
 * - Stores up to 500 events locally
 * - Mirrors to Supabase when env vars exist
 */
export const logEvent = (
  type: AnalyticsEventType,
  payload: Omit<AnalyticsEvent, 'id' | 'type' | 'at'> = {},
) => {
  try {
    const storage = getBrowserStorage();
    if (!storage) return;

    const throttleKey = `${type}:${payload.userId ?? ''}:${payload.athleteSymbol ?? ''}`;
    const now = Date.now();
    const lastSeen = lastEventByKey.get(throttleKey);
    if (lastSeen && now - lastSeen < THROTTLE_MS) return;
    lastEventByKey.set(throttleKey, now);

    const event: AnalyticsEvent = {
      id: createEventId(),
      type,
      at: new Date().toISOString(),
      ...payload,
    };

    const events = readJSON<AnalyticsEvent[]>(storage, EVENTS_KEY, []);
    const next = [...events, event].slice(-500);
    writeJSON(storage, EVENTS_KEY, next);

    void insertSupabaseEvent(event);
  } catch (error) {
    console.error('Failed to log analytics event', error);
  }
};

export const getLoggedEvents = (): AnalyticsEvent[] => {
  try {
    const storage = getBrowserStorage();
    if (!storage) return [];
    return readJSON<AnalyticsEvent[]>(storage, EVENTS_KEY, []);
  } catch {
    return [];
  }
};

declare global {
  interface Window {
    __athlxTestLogEvent?: () => void;
  }
}

if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
  window.__athlxTestLogEvent = () => logEvent('login', { userId: 'test', meta: { hello: 'world' } });
}