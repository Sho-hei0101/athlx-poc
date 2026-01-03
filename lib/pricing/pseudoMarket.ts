import { clampBasePrice } from '@/lib/pricing/basePrice';

const DEFAULT_BASE_PRICE = 0.01;
const DEFAULT_STEP_SEC = 300;
const ORIGIN_MS = Date.UTC(2024, 0, 1, 0, 0, 0);

const normalizeBasePrice = (basePrice: number) => {
  const safe = Number.isFinite(basePrice) && basePrice > 0 ? basePrice : DEFAULT_BASE_PRICE;
  return clampBasePrice(safe);
};

const hash32 = (value: string) => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

const mulberry32 = (seed: number) => {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = Math.imul(value ^ (value >>> 15), value | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const getDeltaPct = (symbol: string, bucket: number) => {
  const rand = mulberry32(hash32(`${symbol}:${bucket}`));
  const amplitude = 0.003 + rand() * 0.005; // 0.3% - 0.8%
  const direction = rand() < 0.5 ? -1 : 1;
  const wobble = (rand() - 0.5) * 0.001;
  return direction * amplitude + wobble;
};

const applyDelta = (price: number, basePrice: number, symbol: string, bucket: number) => {
  const delta = getDeltaPct(symbol, bucket);
  const next = price * (1 + delta);
  const min = basePrice * 0.6;
  const max = basePrice * 1.4;
  return Math.min(max, Math.max(min, next));
};

const getPriceAtBucket = (symbol: string, basePrice: number, bucket: number, stepSec: number) => {
  const normalizedBase = normalizeBasePrice(basePrice);
  const stepMs = stepSec * 1000;
  const originBucket = Math.floor(ORIGIN_MS / stepMs);

  let price = normalizedBase;
  if (bucket <= originBucket) return price;

  for (let current = originBucket + 1; current <= bucket; current += 1) {
    price = applyDelta(price, normalizedBase, symbol, current);
  }

  return price;
};

export const getPseudoSeries = (
  symbol: string,
  basePrice: number,
  range: { from: Date; to: Date; stepSec: number },
): Array<{ t: number; price: number }> => {
  const stepMs = range.stepSec * 1000;
  const startBucket = Math.floor(range.from.getTime() / stepMs);
  const endBucket = Math.floor(range.to.getTime() / stepMs);
  const series: Array<{ t: number; price: number }> = [];

  if (endBucket < startBucket) return series;

  const normalizedBase = normalizeBasePrice(basePrice);
  let price = getPriceAtBucket(symbol, normalizedBase, startBucket, range.stepSec);

  for (let bucket = startBucket; bucket <= endBucket; bucket += 1) {
    if (bucket !== startBucket) {
      price = applyDelta(price, normalizedBase, symbol, bucket);
    }
    series.push({ t: bucket * stepMs, price: Number(price.toFixed(6)) });
  }

  return series;
};

export const getCurrentPseudoPrice = (symbol: string, basePrice: number, now: Date = new Date()) => {
  const stepSec = DEFAULT_STEP_SEC;
  const nowMs = now.getTime();
  const from = new Date(nowMs - 24 * 60 * 60 * 1000);
  const series = getPseudoSeries(symbol, basePrice, { from, to: now, stepSec });
  if (series.length === 0) return normalizeBasePrice(basePrice);
  return series[series.length - 1].price;
};
