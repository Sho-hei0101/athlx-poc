export type DemoStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export const isBrowser = () => typeof window !== 'undefined';

export const getBrowserStorage = (): DemoStorage | null => {
  if (!isBrowser()) return null;
  return window.localStorage;
};

export const readJSON = <T>(storage: DemoStorage, key: string, fallback: T): T => {
  try {
    const raw = storage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Failed to read ${key} from storage`, error);
    return fallback;
  }
};

export const writeJSON = <T>(storage: DemoStorage, key: string, value: T) => {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to write ${key} to storage`, error);
  }
};
