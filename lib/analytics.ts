// Analytics events are stored locally (localStorage) and mirrored to Supabase when available.
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
  try {
    await fetch(`${config.url}/rest/v1/analytics_events`, {
      method: 'POST',
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: event.id,
        type: event.type,
        at: event.at,
        user_id: event.userId ?? null,
        athlete_symbol: event.athleteSymbol ?? null,
        meta: event.meta ?? null
      })
    });
  } catch (error) {
    console.error('Failed to insert analytics event into Supabase', error);
  }
};

export const logEvent = (type: AnalyticsEventType, payload: Omit<AnalyticsEvent, 'id' | 'type' | 'at'> = {}) => {
  const storage = getBrowserStorage();
  if (!storage) return;
  const throttleKey = `${type}:${payload.userId ?? ''}:${payload.athleteSymbol ?? ''}`;
  const now = Date.now();
  const lastSeen = lastEventByKey.get(throttleKey);
  if (lastSeen && now - lastSeen < THROTTLE_MS) {
    return;
  }
  lastEventByKey.set(throttleKey, now);

  const event: AnalyticsEvent = {
    id: createEventId(),
    type,
    at: new Date().toISOString(),
    ...payload
  };

  const events = readJSON<AnalyticsEvent[]>(storage, EVENTS_KEY, []);
  const next = [...events, event].slice(-500);
  writeJSON(storage, EVENTS_KEY, next);

  void insertSupabaseEvent(event);
};

declare global {
  interface Window {
    __athlxTestLogEvent?: () => void;
  }
}

if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
  window.__athlxTestLogEvent = () =>
    logEvent('login', { userId: 'test', meta: { hello: 'world' } });
}
