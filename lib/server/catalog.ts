import 'server-only';

import { kv } from '@vercel/kv';
import { initialAthletes } from '@/lib/data';
import type { Athlete } from '@/lib/types';

export const KV_KEY = 'catalog:athletes';

const normalizeBasePrice = (value: unknown) => {
  const numeric = typeof value === 'number' && Number.isFinite(value) ? value : 0.01;
  return Math.min(0.02, Math.max(0.001, numeric));
};

const normalizeCatalogPayload = (payload: unknown): Athlete[] => {
  if (!Array.isArray(payload)) return [];
  return payload
    .filter((item): item is Athlete => Boolean(item && typeof item === 'object'))
    .map((athlete) => {
      const unitCost = normalizeBasePrice((athlete as Athlete).unitCost);
      return {
        ...athlete,
        symbol: athlete.symbol.toUpperCase(),
        unitCost,
        currentPrice: unitCost,
      };
    });
};

const normalizeSeedCatalog = (athletes: Athlete[]): Athlete[] =>
  athletes.map((athlete) => {
    const unitCost = normalizeBasePrice(athlete.unitCost);
    return {
      ...athlete,
      symbol: athlete.symbol.toUpperCase(),
      unitCost,
      currentPrice: unitCost,
    };
  });

const ensureCatalogSeed = async (): Promise<Athlete[]> => {
  const stored = await kv.get<unknown>(KV_KEY);
  if (stored === null || stored === undefined || !Array.isArray(stored)) {
    const seed = normalizeSeedCatalog(initialAthletes);
    await kv.set(KV_KEY, seed);
    return seed;
  }
  return normalizeCatalogPayload(stored);
};

export const getCatalogAthletes = async (): Promise<Athlete[]> => ensureCatalogSeed();

export const upsertCatalogAthlete = async (newAthlete: Athlete): Promise<Athlete[]> => {
  const current = await getCatalogAthletes();
  const nextSymbol = newAthlete.symbol.toUpperCase();
  const nextCatalog = current.some((athlete) => athlete.symbol.toUpperCase() === nextSymbol)
    ? current.map((athlete) => (athlete.symbol.toUpperCase() === nextSymbol ? { ...newAthlete, symbol: nextSymbol } : athlete))
    : [...current, { ...newAthlete, symbol: nextSymbol }];

  await kv.set(KV_KEY, nextCatalog);
  return nextCatalog;
};
