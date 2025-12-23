export const DEMO_TRADING_FEE_RATE = 0.05;

export const calcTradingFee = (subtotal: number) => Math.max(0, subtotal * DEMO_TRADING_FEE_RATE);
