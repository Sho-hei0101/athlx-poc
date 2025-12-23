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

export const logEvent = (type: AnalyticsEventType, payload: Omit<AnalyticsEvent, 'id' | 'type' | 'at'> = {}) => {
  const storage = getBrowserStorage();
  if (!storage) return;
  const events = readJSON<AnalyticsEvent[]>(storage, EVENTS_KEY, []);
  const next = [
    ...events,
    {
      id: createEventId(),
      type,
      at: new Date().toISOString(),
      ...payload
    }
  ].slice(-500);
  writeJSON(storage, EVENTS_KEY, next);
};
