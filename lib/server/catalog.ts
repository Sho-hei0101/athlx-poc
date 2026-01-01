import 'server-only';

import { kv } from '@vercel/kv';
import type { Athlete } from '@/lib/types';

export const KV_KEY = 'athlx:catalog:athletes:v1';

const normalizeCatalogPayload = (payload: unknown): Athlete[] => {
  if (!Array.isArray(payload)) return [];
  return payload.filter((item): item is Athlete => Boolean(item && typeof item === 'object'));
};

export const getCatalogAthletes = async (): Promise<Athlete[]> => {
  const stored = await kv.get<Athlete[]>(KV_KEY);
  return normalizeCatalogPayload(stored);
};

export const upsertCatalogAthlete = async (newAthlete: Athlete): Promise<Athlete[]> => {
  const current = await getCatalogAthletes();
  const nextSymbol = newAthlete.symbol.toUpperCase();
  const nextCatalog = current.some((athlete) => athlete.symbol.toUpperCase() === nextSymbol)
    ? current.map((athlete) => (athlete.symbol.toUpperCase() === nextSymbol ? { ...newAthlete, symbol: nextSymbol } : athlete))
    : [...current, { ...newAthlete, symbol: nextSymbol }];

  await kv.set(KV_KEY, nextCatalog);
  return nextCatalog;
};
