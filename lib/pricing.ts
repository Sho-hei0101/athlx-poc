export const ATHLX_BASE_PRICE = 0.01;

export const toDisplayPrice = (rawPrice: number): number => {
  const safeRaw = Number.isFinite(rawPrice) ? rawPrice : 0;
  return safeRaw * ATHLX_BASE_PRICE;
};

export const toRawPrice = (displayPrice: number): number => {
  const safeDisplay = Number.isFinite(displayPrice) ? displayPrice : 0;
  return safeDisplay / ATHLX_BASE_PRICE;
};
