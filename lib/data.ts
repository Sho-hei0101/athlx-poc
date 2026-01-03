import { Athlete, Category, NewsItem } from './types';
import { getCategoryBasePrice } from './pricing/basePrice';

const REFERENCE_TIME = Date.UTC(2024, 0, 1, 12, 0, 0);

const seededRandom = (seed: number) => {
  let value = seed;
  return () => {
    value += 0x6D2B79F5;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const getDefaultUnitCost = (category?: Category) => getCategoryBasePrice(category);

// Generate deterministic price history for consistent SSR/CSR hydration.
const generatePriceHistory = (basePrice: number, volatility: number = 0.1, seed: number = 1) => {
  const history: Array<{ time: string; price: number; volume: number }> = [];
  let price = basePrice * 0.8; // Start 20% lower
  const rand = seededRandom(seed);

  for (let i = 0; i < 30; i++) {
    const change = (rand() - 0.5) * volatility * price;
    price = Math.max(price + change, basePrice * 0.5);
    history.push({
      time: new Date(REFERENCE_TIME - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      price: Math.round(price * 100) / 100,
      volume: Math.floor(rand() * 50000) + 10000,
    });
  }

  return history;
};

/**
 * IMPORTANT (Investor Demo):
 * - Keep only 1 sample athlete to avoid confusion.
 * - Clearly tag as "Sample" so it is obvious this is not real data.
 */
const baseAthletes = [
  {
    id: 'sample_1',
    name: 'Sample Athlete — Marco Silva',
    symbol: 'MSIL',
    sport: 'Football',
    category: 'Pro',
    nationality: 'Portugal',
    team: 'FC Porto',
    position: 'Midfielder',
    age: 24,
    height: '1.78m',
    bio:
      'SAMPLE DATA (demo-only). Dynamic midfielder with exceptional vision and passing ability. This profile exists only to demonstrate the platform UX and demo-credit unit activity.',
    profileUrl: 'https://example.com/marco-silva',
    highlightVideoUrl: 'https://www.youtube.com/embed/jNQXAC9IVRw',
    imageUrl: 'https://i.pravatar.cc/300?img=12',
    currentPrice: 250,
    price24hChange: 5.2,
    price7dChange: 12.8,
    tradingVolume: 125000,
    holders: 342,
    tags: ['Sample', 'Featured'],
    priceHistory: generatePriceHistory(250, 0.1, 11),
    createdAt: new Date(REFERENCE_TIME - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
] satisfies Array<Omit<Athlete, 'unitCost' | 'activityIndex'>>;

export const initialAthletes: Athlete[] = baseAthletes.map((athlete) => ({
  ...athlete,
  activityIndex: athlete.currentPrice,
  unitCost: getDefaultUnitCost(athlete.category),
}));

export const initialNews: NewsItem[] = [
  {
    id: 'n1',
    title: '[Sample] Marco Silva — Demo headline for investor preview',
    summary:
      'SAMPLE DATA (demo-only). This news item is included only to show how athlete-related updates appear in the UI.',
    sport: 'Football',
    category: 'Career',
    date: new Date(REFERENCE_TIME - 2 * 24 * 60 * 60 * 1000).toISOString(),
    readMoreUrl: 'https://example.com/news/marco-silva-demo',
    relatedAthleteSymbol: 'MSIL',
  },
  {
    id: 'n2',
    title: '[Pilot] Platform is running in a closed demo environment',
    summary:
      'Demo credits only. No real-world value. This item is shown to demonstrate the “Sports News” layout during investor demos.',
    sport: 'Others',
    category: 'Others',
    date: new Date(REFERENCE_TIME - 5 * 24 * 60 * 60 * 1000).toISOString(),
    readMoreUrl: 'https://example.com/news/pilot-demo-only',
  },
  {
    id: 'n3',
    title: '[Pilot] Analytics & activity simulation (demo-only)',
    summary:
      'This demo can record anonymized interaction events for UX testing. No real-money transactions, no withdrawals, no external transfers.',
    sport: 'Others',
    category: 'Others',
    date: new Date(REFERENCE_TIME - 8 * 24 * 60 * 60 * 1000).toISOString(),
    readMoreUrl: 'https://example.com/news/analytics-demo',
  },
];
