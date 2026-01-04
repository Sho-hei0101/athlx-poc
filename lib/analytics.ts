import { getBrowserStorage, readJSON, writeJSON } from './storage';

export const EVENTS_KEY = 'athlx_events';
const ANALYTICS_USER_KEY = 'athlx_demo_user_id';

export type AnalyticsEventType =
  | 'page_view'
  | 'login'
  | 'signup'
  | 'trade_buy'
  | 'trade_sell'
  | 'athlete_register_submit'
  | 'athlete_update_submit'
  | 'admin_approve'
  | 'admin_delete'
  | 'admin_edit'
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

const getOrCreateAnalyticsUserId = () => {
  const storage = getBrowserStorage();
  if (!storage) return undefined;
  const existing = storage.getItem(ANALYTICS_USER_KEY);
  if (existing) return existing;
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? `demo_${crypto.randomUUID()}`
      : `demo_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
  storage.setItem(ANALYTICS_USER_KEY, id);
  return id;
};

const insertSupabaseEvent = async (event: AnalyticsEvent) => {
  try {
    await fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
      keepalive: true,
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
    const resolvedUserId = payload.userId ?? getOrCreateAnalyticsUserId();

    const throttleKey = `${type}:${resolvedUserId ?? ''}:${payload.athleteSymbol ?? ''}`;
    const now = Date.now();
    const lastSeen = lastEventByKey.get(throttleKey);
    if (lastSeen && now - lastSeen < THROTTLE_MS) return;
    lastEventByKey.set(throttleKey, now);

    const event: AnalyticsEvent = {
      id: createEventId(),
      type,
      at: new Date().toISOString(),
      ...payload,
      userId: resolvedUserId ?? payload.userId,
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
