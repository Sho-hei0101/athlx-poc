import 'server-only';

import { kv } from '@vercel/kv';
import type { Athlete } from '@/lib/types';

const CATALOG_KEY = 'athlx:catalog:athletes';

const normalizeCatalogPayload = (payload: unknown): Athlete[] => {
  if (!Array.isArray(payload)) return [];
  return payload.filter((item): item is Athlete => Boolean(item && typeof item === 'object'));
};

export const getCatalogAthletes = async (): Promise<Athlete[]> => {
  const stored = await kv.get<Athlete[]>(CATALOG_KEY);
  return normalizeCatalogPayload(stored);
};

export const appendCatalogAthlete = async (newAthlete: Athlete): Promise<void> => {
  const current = await getCatalogAthletes();
  const nextSymbol = newAthlete.symbol.toUpperCase();
  const exists = current.some((athlete) => athlete.symbol.toUpperCase() === nextSymbol);
  if (exists) {
    throw new Error('Athlete symbol already exists.');
  }
  const nextCatalog = [...current, { ...newAthlete, symbol: nextSymbol }];
  await kv.set(CATALOG_KEY, nextCatalog);
};
