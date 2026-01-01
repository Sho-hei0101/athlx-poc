'use client';

import React, { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  type AppState,
  type User,
  type Athlete,
  type Trade,
  type Portfolio,
  type PendingAthlete,
  type Category,
  type NextMatchInfo,
  type LastMatchInfo,
  type AthleteUpdate,
  type MatchHomeAway,
  type MatchResult,
} from './types';
import { initialNews } from './data';
import { buildUpdateReason, computeEventScore } from './match';
import { translations } from './translations';
import { EVENTS_KEY, logEvent } from './analytics';
import { calcTradingFee } from './fees';
import { getBrowserStorage, readJSON, writeJSON } from './storage';
import {
  authenticateAccount,
  clearSession,
  createAccount,
  loadAccounts,
  loadSession,
  resetDemoStorage,
  saveSession,
  updateAccount,
  type StoredAccount,
} from './demoAccountStorage';

const STORAGE_KEY = 'athlx_state';
const CATALOG_KEY = 'athlx_catalog_v1';

const getDefaultUnitCost = (category?: Category) => {
  switch (category) {
    case 'Elite':
      return 0.2;
    case 'Pro':
      return 0.1;
    case 'Semi-pro':
      return 0.05;
    case 'Amateur':
    default:
      return 0.01;
  }
};

const normalizeAthletes = (athletes: Athlete[]): Athlete[] => {
  return athletes.map((a) => {
    const unitCost = a.unitCost && a.unitCost > 0 ? a.unitCost : getDefaultUnitCost(a.category);
    const currentPrice = a.currentPrice && a.currentPrice > 0 ? a.currentPrice : unitCost;

    return {
      ...a,
      unitCost,
      currentPrice,
      activityIndex: typeof a.activityIndex === 'number' ? a.activityIndex : 0,
      tradingVolume: typeof a.tradingVolume === 'number' ? a.tradingVolume : 0,
      holders: typeof a.holders === 'number' ? a.holders : 0,
      priceHistory: Array.isArray(a.priceHistory) ? a.priceHistory : [],
    };
  });
};

const defaultState: AppState = {
  currentUser: null,
  athletes: [],
  pendingAthletes: [],
  trades: [],
  athleteUpdates: [],
  news: initialNews,
  language: 'EN',
  isAdmin: false,
};

interface StoreContextType {
  state: AppState;

  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string, name: string) => Promise<User>;
  logout: () => void;

  connectMetaMask: () => void;
  disconnectMetaMask: () => void;

  executeTrade: (athleteSymbol: string, type: 'buy' | 'sell', quantity: number, price: number) => void;
  getPortfolio: () => Portfolio[];

  submitAthleteRegistration: (data: Omit<PendingAthlete, 'id' | 'userId' | 'submittedAt' | 'status'>) => void;
  approveAthlete: (pendingId: string, finalCategory: string, initialPrice: number, symbol: string) => Promise<void>;
  rejectAthlete: (pendingId: string, reason: string) => void;

  getAthleteBySymbol: (symbol: string) => Athlete | undefined;
  updateAthletePrice: (symbol: string, newPrice: number) => void;

  submitMatchUpdate: (athleteSymbol: string, nextMatch?: NextMatchInfo, lastMatch?: LastMatchInfo, approved?: boolean) => void;

  submitAthletePerformanceUpdate: (payload: {
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
  }) => void;

  resetDemoData: () => void;
  setAdminAccess: (value: boolean) => void;

  // Admin PIN を Store に渡して API へ転送する
  setAdminPin: (pin: string | null) => void;

  setLanguage: (lang: 'EN' | 'ES') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(defaultState);
  const [isHydrated, setIsHydrated] = useState(false);
  const adminPinRef = useRef<string | null>(null);

  const buildPortfolioFromTrades = (trades: Trade[], athletes: Athlete[]): Portfolio[] => {
    const portfolioMap = new Map<string, Portfolio>();

    trades.forEach((trade) => {
      const existing = portfolioMap.get(trade.athleteSymbol);

      if (trade.type === 'buy') {
        if (existing) {
          const totalQuantity = existing.quantity + trade.quantity;
          const totalCost = existing.avgBuyPrice * existing.quantity + trade.price * trade.quantity;
          portfolioMap.set(trade.athleteSymbol, {
            ...existing,
            quantity: totalQuantity,
            avgBuyPrice: totalCost / totalQuantity,
          });
        } else {
          portfolioMap.set(trade.athleteSymbol, {
            athleteSymbol: trade.athleteSymbol,
            athleteName: trade.athleteName,
            quantity: trade.quantity,
            avgBuyPrice: trade.price,
            currentPrice: trade.price,
          });
        }
      } else if (existing) {
        const newQuantity = existing.quantity - trade.quantity;
        if (newQuantity > 0) {
          portfolioMap.set(trade.athleteSymbol, { ...existing, quantity: newQuantity });
        } else {
          portfolioMap.delete(trade.athleteSymbol);
        }
      }
    });

    return Array.from(portfolioMap.values()).map((p) => {
      const athlete = athletes.find((a) => a.symbol === p.athleteSymbol);
      const fallback = athlete?.unitCost ?? p.currentPrice ?? 0;
      return { ...p, currentPrice: athlete?.currentPrice ?? fallback };
    });
  };

  const persistCurrentAccount = (email: string, updater: (account: StoredAccount) => StoredAccount) => {
    const storage = getBrowserStorage();
    if (!storage) return;
    updateAccount(storage, email, updater);
  };

  /**
   * ✅ KVへ Athlete を upsert して、最新 catalog を返す（全ユーザー共通）
   * - ここが “共通化” の要
   */
  const persistAthleteToCatalog = async (athlete: Athlete): Promise<Athlete[]> => {
    const adminPin = adminPinRef.current;
    if (!adminPin) throw new Error('Admin PIN is required.');

    const res = await fetch('/api/catalog/athletes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-pin': adminPin,
      },
      body: JSON.stringify(athlete),
    });

    if (!res.ok) {
      let msg = 'Failed to persist athlete to KV.';
      try {
        const data = (await res.json()) as { error?: string };
        if (data?.error) msg = data.error;
      } catch {
        // ignore
      }
      throw new Error(msg);
    }

    const data = (await res.json()) as { athletes?: Athlete[] };
    return normalizeAthletes(data?.athletes ?? []);
  };

  /**
   * ✅ KVの catalog をGETで取り直して state/local を揃える（整合性確保）
   */
  const refreshCatalogFromApi = async () => {
    const storage = getBrowserStorage();
    try {
      const res = await fetch('/api/catalog/athletes', { method: 'GET' });
      if (!res.ok) return;

      const data = (await res.json()) as { athletes?: Athlete[] };
      if (!Array.isArray(data?.athletes)) return;

      const hydrated = normalizeAthletes(data.athletes);
      setState((prev) => ({ ...prev, athletes: hydrated }));
      if (storage) writeJSON(storage, CATALOG_KEY, hydrated);
    } catch {
      // ignore
    }
  };

  // Hydrate (local state + session) then hydrate catalog from API(KV)
  useEffect(() => {
    const storage = getBrowserStorage();
    if (!storage) {
      setIsHydrated(true);
      return;
    }

    const stored = readJSON<Partial<AppState>>(storage, STORAGE_KEY, {});
    const storedUser = loadSession(storage);

    let persistedState: AppState = { ...defaultState, athletes: defaultState.athletes };

    if (stored && Object.keys(stored).length > 0) {
      persistedState = { ...defaultState, ...stored, athletes: defaultState.athletes };
    }

    if (storedUser?.email) {
      const accounts = loadAccounts(storage);
      const account = accounts[storedUser.email];
      if (account) {
        persistedState = {
          ...persistedState,
          currentUser: {
            id: account.id,
            email: account.email,
            name: account.name,
            athlxBalance: account.athlxBalance,
            metaMaskAddress: undefined,
            linkedAthleteId: account.linkedAthleteId,
          },
          trades: account.trades ?? [],
          isAdmin: false,
        };
      }
    }

    setState({ ...persistedState, isAdmin: false });
    setIsHydrated(true);

    let isActive = true;
    const loadCatalog = async () => {
      try {
        const response = await fetch('/api/catalog/athletes');
        if (!response.ok) {
          console.error('Failed to load catalog athletes', response.status);
          return;
        }
        const data = (await response.json()) as { athletes?: Athlete[] };
        if (!isActive || !Array.isArray(data?.athletes)) return;
        const hydratedAthletes = normalizeAthletes(data.athletes);
        setState((prev) => ({ ...prev, athletes: hydratedAthletes }));

        // 速度最適化：localにも同期（ただし source of truth はKV）
        writeJSON(storage, CATALOG_KEY, hydratedAthletes);
      } catch (error) {
        console.error('Catalog hydration failed', error);
      }
    };

    void loadCatalog();
    return () => {
      isActive = false;
    };
  }, []);

  // Persist (state except athletes) to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    const storage = getBrowserStorage();
    if (!storage) return;
    const { athletes, ...stateWithoutAthletes } = state;
    writeJSON(storage, STORAGE_KEY, stateWithoutAthletes as Partial<AppState>);
  }, [state, isHydrated]);

  const login = async (email: string, password: string): Promise<User> => {
    const storage = getBrowserStorage();
    if (!storage) throw new Error('Storage unavailable');

    const account = authenticateAccount(storage, { email, password });
    if (!account) throw new Error('Invalid credentials');

    const loggedInUser: User = {
      id: account.id,
      email: account.email,
      name: account.name,
      athlxBalance: account.athlxBalance,
      metaMaskAddress: undefined,
      linkedAthleteId: account.linkedAthleteId,
    };

    setState((prev) => ({
      ...prev,
      currentUser: loggedInUser,
      trades: account.trades ?? [],
      isAdmin: false,
    }));

    saveSession(storage, account.email);
    logEvent('login', { userId: account.id });
    return loggedInUser;
  };

  const signup = async (email: string, password: string, name: string): Promise<User> => {
    const storage = getBrowserStorage();
    if (!storage) throw new Error('Storage unavailable');

    const newAccount = createAccount(storage, { email, password, name });

    const loggedInUser: User = {
      id: newAccount.id,
      email: newAccount.email,
      name: newAccount.name,
      athlxBalance: newAccount.athlxBalance,
      metaMaskAddress: undefined,
      linkedAthleteId: undefined,
    };

    setState((prev) => ({ ...prev, currentUser: loggedInUser, trades: [], isAdmin: false }));
    saveSession(storage, loggedInUser.email);
    logEvent('signup', { userId: loggedInUser.id });
    return loggedInUser;
  };

  const logout = () => {
    const storage = getBrowserStorage();
    setState((prev) => ({ ...prev, currentUser: null, trades: [], isAdmin: false }));
    adminPinRef.current = null;
    if (!storage) return;
    clearSession(storage);
  };

  const connectMetaMask = () => {
    if (!state.currentUser) return;
    const address = `0x${Math.random().toString(16).substring(2, 10)}...${Math.random()
      .toString(16)
      .substring(2, 6)}`;
    setState((prev) => ({
      ...prev,
      currentUser: prev.currentUser ? { ...prev.currentUser, metaMaskAddress: address } : null,
    }));
  };

  const disconnectMetaMask = () => {
    if (!state.currentUser) return;
    setState((prev) => ({
      ...prev,
      currentUser: prev.currentUser ? { ...prev.currentUser, metaMaskAddress: undefined } : null,
    }));
  };

  const executeTrade = (athleteSymbol: string, type: 'buy' | 'sell', quantity: number, price: number) => {
    if (!state.currentUser) return;

    // Zero-ownership: athlete-linked accounts cannot trade (demo-enforced)
    if (state.currentUser.linkedAthleteId) {
      const tr = translations[state.language];
      throw new Error(tr.cannotTradeOwnUnits);
    }

    const athlete = state.athletes.find((a) => a.symbol === athleteSymbol);
    if (!athlete) return;

    const safeQuantity = Math.max(0, Number(quantity) || 0);
    const safePrice = Math.max(0, Number(price) || 0);

    const subtotal = Math.max(0, safeQuantity * safePrice);
    const fee = calcTradingFee(subtotal);
    const total = Math.max(0, type === 'buy' ? subtotal + fee : subtotal - fee);

    const newBalance =
      type === 'buy' ? state.currentUser.athlxBalance - total : state.currentUser.athlxBalance + total;

    if (type === 'buy' && newBalance < 0) throw new Error('Insufficient balance');

    const trade: Trade = {
      id: `trade_${Date.now()}`,
      userId: state.currentUser.id,
      athleteSymbol,
      athleteName: athlete.name,
      type,
      quantity: safeQuantity,
      price: safePrice,
      fee,
      total,
      timestamp: new Date().toISOString(),
    };

    const updatedAthletes = state.athletes.map((a) => {
      if (a.symbol !== athleteSymbol) return a;
      return {
        ...a,
        tradingVolume: (a.tradingVolume ?? 0) + subtotal,
        holders: type === 'buy' ? (a.holders ?? 0) + 1 : Math.max((a.holders ?? 0) - 1, 0),
      };
    });

    const updatedTrades = [...state.trades, trade];

    setState((prev) => ({
      ...prev,
      currentUser: prev.currentUser ? { ...prev.currentUser, athlxBalance: newBalance } : null,
      trades: updatedTrades,
      athletes: updatedAthletes,
    }));

    persistCurrentAccount(state.currentUser.email, (account) => {
      const updatedPortfolio = buildPortfolioFromTrades(updatedTrades, updatedAthletes);
      return {
        ...account,
        athlxBalance: newBalance,
        trades: updatedTrades,
        portfolio: updatedPortfolio,
      };
    });

    logEvent(type === 'buy' ? 'trade_buy' : 'trade_sell', {
      userId: state.currentUser.id,
      athleteSymbol,
      meta: { quantity: safeQuantity, price: safePrice, subtotal, fee, total, currency: 'tATHLX' },
    });
  };

  const getPortfolio = (): Portfolio[] => {
    if (!state.currentUser) return [];
    const userTrades = state.trades.filter((t) => t.userId === state.currentUser!.id);
    return buildPortfolioFromTrades(userTrades, state.athletes);
  };

  const submitAthleteRegistration = (data: Omit<PendingAthlete, 'id' | 'userId' | 'submittedAt' | 'status'>) => {
    if (!state.currentUser) return;

    const pending: PendingAthlete = {
      ...data,
      id: `pending_${Date.now()}`,
      userId: state.currentUser.id,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };

    setState((prev) => ({ ...prev, pendingAthletes: [...prev.pendingAthletes, pending] }));
    logEvent('athlete_register_submit', { userId: state.currentUser.id });
  };

  // ✅ Approve -> POST /api/catalog/athletes (Vercel KVに保存)
  const approveAthlete = async (pendingId: string, finalCategory: string, initialPrice: number, symbol: string) => {
    const pending = state.pendingAthletes.find((p) => p.id === pendingId);
    if (!pending) return;

    const normalizedCategory = finalCategory as Category;
    const unitCost = initialPrice > 0 ? initialPrice : getDefaultUnitCost(normalizedCategory);
    const safeId = `athlete_${(crypto as any)?.randomUUID?.() ?? Date.now()}`;

    const newAthlete: Athlete = {
      id: safeId,
      name: pending.name,
      symbol: symbol.toUpperCase(),
      sport: pending.sport,
      category: normalizedCategory,
      nationality: pending.nationality,
      team: pending.team,
      position: pending.position,
      age: new Date().getFullYear() - new Date(pending.dateOfBirth).getFullYear(),
      height: '1.75m',
      bio: pending.bio,
      profileUrl: pending.profileUrl,
      highlightVideoUrl: pending.highlightVideoUrl,
      imageUrl: pending.imageDataUrl ?? `https://i.pravatar.cc/300?img=${Math.floor(Math.random() * 70)}`,
      unitCost,
      currentPrice: unitCost,
      activityIndex: unitCost,
      price24hChange: 0,
      price7dChange: 0,
      tradingVolume: 0,
      holders: 0,
      tags: ['New'],
      priceHistory: [{ time: new Date().toISOString(), price: unitCost, volume: 0 }],
      createdAt: new Date().toISOString(),
      userId: pending.userId,
    };

    const adminPin = adminPinRef.current;
    if (!adminPin) throw new Error('Admin PIN is required to approve athletes.');

    const res = await fetch('/api/catalog/athletes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-pin': adminPin },
      body: JSON.stringify(newAthlete),
    });

    if (!res.ok) {
      let msg = 'Failed to approve athlete.';
      try {
        const data = (await res.json()) as { error?: string };
        if (data?.error) msg = data.error;
      } catch {
        // ignore
      }
      throw new Error(msg);
    }

    const data = (await res.json()) as { athletes?: Athlete[] };
    const nextCatalog = normalizeAthletes(data?.athletes ?? [...state.athletes, newAthlete]);

    // 速度最適化：localにも同期（source of truth はKV）
    const storage = getBrowserStorage();
    if (storage) writeJSON(storage, CATALOG_KEY, nextCatalog);

    setState((prev) => ({
      ...prev,
      athletes: nextCatalog,
      pendingAthletes: prev.pendingAthletes.map((p) => (p.id === pendingId ? { ...p, status: 'approved' as const } : p)),
      currentUser:
        prev.currentUser?.id === pending.userId ? { ...prev.currentUser, linkedAthleteId: newAthlete.id } : prev.currentUser,
    }));

    if (pending.userId && state.currentUser?.id === pending.userId) {
      persistCurrentAccount(state.currentUser.email, (account) => ({ ...account, linkedAthleteId: newAthlete.id }));
    }

    logEvent('admin_approve', { userId: pending.userId, athleteSymbol: newAthlete.symbol });
  };

  const rejectAthlete = (pendingId: string, reason: string) => {
    setState((prev) => ({
      ...prev,
      pendingAthletes: prev.pendingAthletes.map((p) =>
        p.id === pendingId ? { ...p, status: 'rejected' as const, rejectionReason: reason } : p,
      ),
    }));
    logEvent('admin_reject', { userId: state.currentUser?.id });
  };

  const getAthleteBySymbol = (symbol: string): Athlete | undefined => state.athletes.find((a) => a.symbol === symbol);

  const updateAthletePrice = (symbol: string, newPrice: number) => {
    setState((prev) => ({
      ...prev,
      athletes: prev.athletes.map((a) => {
        if (a.symbol !== symbol) return a;
        const base = a.currentPrice || 0.0001;
        const change24h = ((newPrice - base) / base) * 100;
        return {
          ...a,
          currentPrice: newPrice,
          unitCost: newPrice,
          price24hChange: change24h,
          priceHistory: [
            ...(a.priceHistory ?? []),
            { time: new Date().toISOString(), price: newPrice, volume: Math.floor(Math.random() * 10000) },
          ],
        };
      }),
    }));
  };

  /**
   * ✅ 試合更新：ローカル更新 + KVへ永続化（全ユーザー共通）
   */
  const submitMatchUpdate = (athleteSymbol: string, nextMatch?: NextMatchInfo, lastMatch?: LastMatchInfo, approved = true) => {
    let updatedTarget: Athlete | null = null;

    setState((prev) => {
      const nextAthletes = prev.athletes.map((athlete) => {
        if (athlete.symbol !== athleteSymbol) return athlete;

        const updateScore = computeEventScore(nextMatch, lastMatch);
        const updatedActivityIndex = approved ? Math.max(0, athlete.activityIndex + updateScore) : athlete.activityIndex;

        const updatedUnitCost = approved
          ? Math.max(getDefaultUnitCost(athlete.category), athlete.unitCost + updateScore * 0.01)
          : athlete.unitCost;

        const nextAthlete: Athlete = {
          ...athlete,
          nextMatch,
          lastMatch,
          activityIndex: updatedActivityIndex,
          unitCost: updatedUnitCost,
          currentPrice: updatedUnitCost,
          lastUpdateReason: approved ? buildUpdateReason(nextMatch, lastMatch) : athlete.lastUpdateReason,
          priceHistory: approved
            ? [...(athlete.priceHistory ?? []), { time: new Date().toISOString(), price: updatedUnitCost, volume: 0 }]
            : athlete.priceHistory,
        };

        updatedTarget = nextAthlete;
        return nextAthlete;
      });

      return { ...prev, athletes: nextAthletes };
    });

    void (async () => {
      try {
        if (!approved) return;
        if (!updatedTarget) return;

        const nextCatalog = await persistAthleteToCatalog(updatedTarget);

        // 成功したら state/local を “KVの真実” に揃える
        setState((prev) => ({ ...prev, athletes: nextCatalog }));
        const storage = getBrowserStorage();
        if (storage) writeJSON(storage, CATALOG_KEY, nextCatalog);
      } catch (e) {
        console.error('Failed to persist match update to KV', e);
      }
    })();
  };

  /**
   * ✅ パフォーマンス更新：ローカル更新 + KVへ永続化（全ユーザー共通）
   */
  const submitAthletePerformanceUpdate = (payload: {
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
  }) => {
    let updatedTarget: Athlete | null = null;

    setState((prev) => {
      const targetAthlete = prev.athletes.find((athlete) => athlete.symbol === payload.athleteSymbol);
      if (!targetAthlete) return prev;

      const minutesPlayed = Math.max(0, Math.min(90, Number(payload.minutesPlayed) || 0));
      const goals = Math.max(0, Math.min(10, Number(payload.goals) || 0));
      const assists = Math.max(0, Math.min(10, Number(payload.assists) || 0));

      const resultDelta = payload.result === 'Win' ? 0.4 : payload.result === 'Draw' ? 0.1 : -0.2;

      const baseDelta =
        (minutesPlayed / 90) * 0.5 +
        goals * 0.8 +
        assists * 0.5 +
        resultDelta +
        (payload.injury ? -1.0 : 0);

      const noise = Math.random() * 0.02 - 0.01;

      const updatedUnitCost = Math.min(5, Math.max(0.001, targetAthlete.unitCost * (1 + baseDelta / 10 + noise)));
      const updatedActivityIndex = Math.max(0, targetAthlete.activityIndex + baseDelta);

      const minutesBucket =
        minutesPlayed >= 61 ? '61-90' : minutesPlayed >= 31 ? '31-60' : minutesPlayed >= 1 ? '1-30' : '0';

      const updateReason =
        payload.notes ||
        buildUpdateReason(undefined, {
          date: payload.matchDate,
          minutesBucket,
          result: payload.result,
          goals: goals || undefined,
          assists: assists || undefined,
          injury: payload.injury,
        });

      const updateRecord: AthleteUpdate = {
        id: `update_${Date.now()}`,
        athleteSymbol: payload.athleteSymbol,
        matchDate: payload.matchDate,
        opponent: payload.opponent,
        homeAway: payload.homeAway,
        minutesPlayed,
        result: payload.result,
        goals,
        assists,
        injury: payload.injury,
        notes: payload.notes,
        submittedAt: new Date().toISOString(),
        baseDelta,
        newUnitCost: updatedUnitCost,
        newActivityIndex: updatedActivityIndex,
      };

      const nextAthletes = prev.athletes.map((athlete) => {
        if (athlete.symbol !== payload.athleteSymbol) return athlete;

        const nextAthlete: Athlete = {
          ...athlete,
          lastMatch: {
            date: payload.matchDate,
            minutesBucket,
            result: payload.result,
            goals: goals || undefined,
            assists: assists || undefined,
            injury: payload.injury,
          },
          activityIndex: updatedActivityIndex,
          unitCost: updatedUnitCost,
          currentPrice: updatedUnitCost,
          lastUpdateReason: updateReason,
          priceHistory: [
            ...(athlete.priceHistory ?? []),
            { time: new Date().toISOString(), price: updatedUnitCost, volume: Math.floor(Math.random() * 10000) },
          ],
        };

        updatedTarget = nextAthlete;
        return nextAthlete;
      });

      return {
        ...prev,
        athletes: nextAthletes,
        athleteUpdates: [...prev.athleteUpdates, updateRecord],
      };
    });

    logEvent('athlete_update_submit', { userId: state.currentUser?.id, athleteSymbol: payload.athleteSymbol });

    void (async () => {
      try {
        if (!updatedTarget) return;

        const nextCatalog = await persistAthleteToCatalog(updatedTarget);

        // 成功したら state/local を “KVの真実” に揃える
        setState((prev) => ({ ...prev, athletes: nextCatalog }));
        const storage = getBrowserStorage();
        if (storage) writeJSON(storage, CATALOG_KEY, nextCatalog);
      } catch (e) {
        console.error('Failed to persist performance update to KV', e);
      }
    })();
  };

  const resetDemoData = () => {
    if (!state.isAdmin) {
      const tr = translations[state.language];
      throw new Error(tr.adminOnly);
    }

    logEvent('reset', { userId: state.currentUser?.id });

    const storage = getBrowserStorage();
    if (!storage) return;

    storage.removeItem(STORAGE_KEY);
    storage.removeItem(EVENTS_KEY);
    resetDemoStorage(storage);

    setState(defaultState);

    // KV側は消さない（全ユーザー共通カタログなので）
  };

  const setAdminAccess = (value: boolean) => {
    setState((prev) => ({ ...prev, isAdmin: value }));
    if (!value) adminPinRef.current = null;
  };

  const setAdminPin = (pin: string | null) => {
    adminPinRef.current = pin;
    // PINを入れた直後にKV catalogを取り直してもよい（任意）
    // void refreshCatalogFromApi();
  };

  const setLanguage = (lang: 'EN' | 'ES') => {
    setState((prev) => ({ ...prev, language: lang }));
  };

  return (
    <StoreContext.Provider
      value={{
        state,
        login,
        signup,
        logout,
        connectMetaMask,
        disconnectMetaMask,
        executeTrade,
        getPortfolio,
        submitAthleteRegistration,
        approveAthlete,
        rejectAthlete,
        getAthleteBySymbol,
        updateAthletePrice,
        submitMatchUpdate,
        submitAthletePerformanceUpdate,
        resetDemoData,
        setAdminAccess,
        setAdminPin,
        setLanguage,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
};
