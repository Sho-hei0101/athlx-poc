import 'server-only';

import { kv } from '@vercel/kv';
import { initialAthletes } from '@/lib/data';
import { clampBasePrice, resolveAthleteUnitCost } from '@/lib/pricing/basePrice';
import type { Athlete } from '@/lib/types';

export const KV_KEY = 'catalog:athletes:v1';

const normalizeBasePrice = (value: unknown) => {
  const numeric = typeof value === 'number' && Number.isFinite(value) ? value : 0.01;
  return clampBasePrice(numeric);
};

const normalizeCatalogPayload = (payload: unknown): Athlete[] => {
  if (!Array.isArray(payload)) return [];
  return payload
    .filter((item): item is Athlete => Boolean(item && typeof item === 'object'))
    .map((athlete) => {
      const unitCost = resolveAthleteUnitCost(athlete as Athlete);
      const existingPrice =
        typeof (athlete as Athlete).currentPrice === 'number' &&
        Number.isFinite((athlete as Athlete).currentPrice)
          ? (athlete as Athlete).currentPrice
          : unitCost;
      return {
        ...athlete,
        symbol: athlete.symbol.toUpperCase(),
        unitCost,
        currentPrice: existingPrice,
        unitCostOverride: (athlete as Athlete).unitCostOverride,
      };
    });
};

const normalizeSeedCatalog = (athletes: Athlete[]): Athlete[] =>
  athletes.map((athlete) => {
    const unitCost = resolveAthleteUnitCost(athlete);
    return {
      ...athlete,
      symbol: athlete.symbol.toUpperCase(),
      unitCost,
      currentPrice: unitCost,
      unitCostOverride: athlete.unitCostOverride,
    };
  });

const mergeSeedAthletes = (existing: Athlete[], seed: Athlete[]): Athlete[] => {
  const existingSymbols = new Set(existing.map((athlete) => athlete.symbol.toUpperCase()));
  const additions = seed.filter((athlete) => !existingSymbols.has(athlete.symbol.toUpperCase()));
  return additions.length ? [...existing, ...additions] : existing;
};

const extractCatalogArray = (stored: unknown): Athlete[] | null => {
  if (Array.isArray(stored)) {
    return normalizeCatalogPayload(stored);
  }
  if (stored && typeof stored === 'object') {
    const nested = (stored as { athletes?: unknown }).athletes;
    if (Array.isArray(nested)) {
      return normalizeCatalogPayload(nested);
    }
  }
  return null;
};

const ensureCatalogSeed = async (): Promise<Athlete[]> => {
  const stored = await kv.get<unknown>(KV_KEY);
  if (stored === null || stored === undefined) {
    const seed = normalizeSeedCatalog(initialAthletes);
    await kv.set(KV_KEY, seed);
    return seed;
  }
  const extracted = extractCatalogArray(stored);
  if (extracted) {
    const seed = normalizeSeedCatalog(initialAthletes);
    const merged = mergeSeedAthletes(extracted, seed);
    if (merged.length !== extracted.length) {
      await kv.set(KV_KEY, merged);
    }
    return merged;
  }
  console.warn('Catalog payload invalid; returning seed catalog without overwriting.');
  return normalizeSeedCatalog(initialAthletes);
};

export const getCatalogAthletes = async (): Promise<Athlete[]> => ensureCatalogSeed();

export const setCatalogAthletes = async (athletes: Athlete[]): Promise<Athlete[]> => {
  const nextCatalog = normalizeSeedCatalog(athletes);
  await kv.set(KV_KEY, nextCatalog);
  return nextCatalog;
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

export const updateCatalogAthlete = async (
  symbol: string,
  patch: Partial<Athlete>,
): Promise<{ nextCatalog: Athlete[]; updated?: Athlete }> => {
  const current = await getCatalogAthletes();
  const targetSymbol = symbol.toUpperCase();
  const index = current.findIndex((athlete) => athlete.symbol.toUpperCase() === targetSymbol);
  if (index < 0) {
    return { nextCatalog: current };
  }
  const existing = current[index];
  const unitCost = normalizeBasePrice(patch.unitCost ?? existing.unitCost);
  const updated: Athlete = {
    ...existing,
    ...patch,
    symbol: existing.symbol,
    unitCost,
    currentPrice: unitCost,
    unitCostOverride: patch.unitCostOverride ?? existing.unitCostOverride,
  };
  const nextCatalog = current.map((athlete, idx) => (idx === index ? updated : athlete));
  await kv.set(KV_KEY, nextCatalog);
  return { nextCatalog, updated };
};

export const deleteCatalogAthlete = async (symbol: string): Promise<Athlete[]> => {
  const current = await getCatalogAthletes();
  const targetSymbol = symbol.toUpperCase();
  const nextCatalog = current.filter((athlete) => athlete.symbol.toUpperCase() !== targetSymbol);
  await kv.set(KV_KEY, nextCatalog);
  return nextCatalog;
};
