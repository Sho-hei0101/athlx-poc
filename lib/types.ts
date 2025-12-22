// Core types for AthleteXchange

export type Category = 'Amateur' | 'Semi-pro' | 'Pro' | 'Elite';

export type MatchHomeAway = 'Home' | 'Away';
export type MatchExpectedRole = 'Starter' | 'Bench' | 'Not in squad';
export type MatchCondition = '100%' | 'Minor' | 'Not 100%';
export type MatchImportance = 'League' | 'Cup' | 'Friendly';
export type MatchMinutesBucket = '0' | '1-30' | '31-60' | '61-90';
export type MatchResult = 'Win' | 'Draw' | 'Loss';

export interface NextMatchInfo {
  date: string;
  opponent: string;
  homeAway: MatchHomeAway;
  expectedRole: MatchExpectedRole;
  condition: MatchCondition;
  importance: MatchImportance;
}

export interface LastMatchInfo {
  date: string;
  minutesBucket: MatchMinutesBucket;
  result: MatchResult;
  goals?: number;
  assists?: number;
  injury?: boolean;
}

export type Sport = 
  | 'Football' 
  | 'Basketball' 
  | 'Athletics' 
  | 'Swimming' 
  | 'Tennis' 
  | 'Gymnastics' 
  | 'Volleyball' 
  | 'Rugby Sevens' 
  | 'Boxing' 
  | 'Judo'
  | 'Cycling'
  | 'Rowing'
  | 'Table Tennis'
  | 'Badminton'
  | 'Fencing'
  | 'Weightlifting'
  | 'Wrestling'
  | 'Taekwondo'
  | 'Archery'
  | 'Shooting'
  | 'Cricket'
  | 'eSports'
  | 'Others';

export interface Athlete {
  id: string;
  name: string;
  symbol: string;
  sport: Sport;
  category: Category;
  nationality: string;
  team: string;
  position: string;
  age: number;
  height: string;
  bio: string;
  profileUrl: string;
  highlightVideoUrl: string;
  imageUrl: string;
  unitCost: number;
  activityIndex: number;
  currentPrice: number;
  nextMatch?: NextMatchInfo;
  lastMatch?: LastMatchInfo;
  lastUpdateReason?: string;
  price24hChange: number;
  price7dChange: number;
  tradingVolume: number;
  holders: number;
  tags: string[];
  priceHistory: { time: string; price: number; volume: number }[];
  createdAt: string;
  userId?: string;
}

export interface Trade {
  id: string;
  userId: string;
  athleteSymbol: string;
  athleteName: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  fee: number;
  total: number;
  timestamp: string;
}

export interface Portfolio {
  athleteSymbol: string;
  athleteName: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  athlxBalance: number;
  metaMaskAddress?: string;
  linkedAthleteId?: string;
}

export interface PendingAthlete {
  id: string;
  userId: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  sport: Sport;
  requestedCategory: Category;
  team: string;
  position: string;
  bio: string;
  profileUrl: string;
  highlightVideoUrl: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  sport: Sport;
  category: 'Transfer' | 'Performance' | 'Injury' | 'Career' | 'Others';
  date: string;
  readMoreUrl: string;
  relatedAthleteSymbol?: string;
}

export interface AthleteUpdate {
  id: string;
  athleteSymbol: string;
  matchDate: string;
  opponent: string;
  homeAway: MatchHomeAway;
  minutesPlayed: number;
  result: MatchResult;
  goals: number;
  assists: number;
  injury: boolean;
  notes: string;
  submittedAt: string;
  baseDelta: number;
  newUnitCost: number;
  newActivityIndex: number;
}

export interface AppState {
  currentUser: User | null;
  athletes: Athlete[];
  pendingAthletes: PendingAthlete[];
  trades: Trade[];
  athleteUpdates: AthleteUpdate[];
  news: NewsItem[];
  language: 'EN' | 'ES';
}
