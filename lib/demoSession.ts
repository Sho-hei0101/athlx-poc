import { getBrowserStorage } from './storage';

export const DEMO_SESSION_ID_KEY = 'athlx:demoSessionId';

const generateDemoSessionId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `demo_${crypto.randomUUID()}`;
  }
  return `demo_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
};

export const getStoredDemoSessionId = (storage?: Storage) => {
  const safeStorage = storage ?? getBrowserStorage();
  if (!safeStorage) return null;
  return safeStorage.getItem(DEMO_SESSION_ID_KEY);
};

export const getOrCreateDemoSessionId = (storage?: Storage) => {
  const safeStorage = storage ?? getBrowserStorage();
  if (!safeStorage) return generateDemoSessionId();
  const existing = safeStorage.getItem(DEMO_SESSION_ID_KEY);
  if (existing) return existing;
  const created = generateDemoSessionId();
  safeStorage.setItem(DEMO_SESSION_ID_KEY, created);
  return created;
};
