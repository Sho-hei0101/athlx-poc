import type { Athlete, Category } from '@/lib/types';

export const CATEGORY_BASE_PRICES: Record<Category, number> = {
  Amateur: 0.005,
  'Semi-pro': 0.01,
  Pro: 0.1,
  Elite: 0.8,
};

export const LEGACY_DEFAULT_BASE_PRICE = 0.01;

const MIN_BASE_PRICE = 0.001;
const MAX_BASE_PRICE = 2;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const clampBasePrice = (value: number) => {
  const safe = Number.isFinite(value) ? value : LEGACY_DEFAULT_BASE_PRICE;
  return clamp(safe, MIN_BASE_PRICE, MAX_BASE_PRICE);
};

export const getCategoryBasePrice = (category?: Category) => {
  if (category && CATEGORY_BASE_PRICES[category]) {
    return CATEGORY_BASE_PRICES[category];
  }
  return LEGACY_DEFAULT_BASE_PRICE;
};

export const hasCustomUnitCost = (athlete: Pick<Athlete, 'unitCost' | 'unitCostOverride' | 'category'>) => {
  if (athlete.unitCostOverride) return true;
  if (!Number.isFinite(athlete.unitCost)) return false;
  const categoryBase = getCategoryBasePrice(athlete.category);
  if (athlete.unitCost === LEGACY_DEFAULT_BASE_PRICE) return false;
  if (athlete.unitCost === categoryBase) return false;
  return true;
};

export const resolveAthleteUnitCost = (
  athlete: Pick<Athlete, 'unitCost' | 'unitCostOverride' | 'category'>,
) => {
  if (hasCustomUnitCost(athlete)) {
    return clampBasePrice(athlete.unitCost ?? getCategoryBasePrice(athlete.category));
  }
  return clampBasePrice(getCategoryBasePrice(athlete.category));
};
