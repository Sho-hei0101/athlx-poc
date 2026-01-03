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
import { getOrCreateDemoSessionId, getStoredDemoSessionId } from './demoSession';
import { clampBasePrice, getCategoryBasePrice, resolveAthleteUnitCost } from './pricing/basePrice';
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

/**
 * ✅ 価格は全員共通で 0.01 を基準にする（カテゴリは伸び方/ブレ幅にだけ影響）
 */
// 価格の下限・上限（デモ安全装置）
const clampPrice = (p: number) => clampBasePrice(p);

const normalizeAthletes = (athletes: Athlete[]): Athlete[] => {
  return athletes.map((a) => {
    const unitCost = resolveAthleteUnitCost(a);
    const currentPrice = unitCost;

    return {
      ...a,
      unitCost: clampPrice(unitCost),
      currentPrice: clampPrice(currentPrice),
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

  deleteAthlete: (symbol: string) => Promise<void>;
  updateAthlete: (symbol: string, patch: Partial<Athlete>) => Promise<void>;

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
      const fallback = athlete?.unitCost ?? p.currentPrice ?? getCategoryBasePrice(athlete?.category);
      return { ...p, currentPrice: athlete?.currentPrice ?? fallback };
    });
  };

  const persistCurrentAccount = (email: string, updater: (account: StoredAccount) => StoredAccount) => {
    const storage = getBrowserStorage();
    if (!storage) return;
    updateAccount(storage, email, updater);
  };

  const getAdminHeaders = () => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (adminPinRef.current) {
      headers['x-admin-pin'] = adminPinRef.current;
    }
    return headers;
  };

  const fetchCatalog = async (): Promise<Athlete[]> => {
    const response = await fetch('/api/catalog/athletes', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to load catalog athletes (${response.status})`);
    }
    const data = (await response.json()) as { athletes?: Athlete[] };
    if (!Array.isArray(data?.athletes)) {
      throw new Error('Catalog payload invalid');
    }

    return normalizeAthletes(
      data.athletes.map((a) => {
        const unitCost = resolveAthleteUnitCost(a);
        return { ...a, unitCost, currentPrice: unitCost };
      }),
    );
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
    getOrCreateDemoSessionId(storage);
    const storedDemoSessionId = getStoredDemoSessionId(storage);

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
            metaMaskAddress: storedDemoSessionId ?? undefined,
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
        const hydratedAthletes = await fetchCatalog();
        if (!isActive) return;
        setState((prev) => ({ ...prev, athletes: hydratedAthletes }));
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

    const demoSessionId = getOrCreateDemoSessionId(storage);
    const loggedInUser: User = {
      id: account.id,
      email: account.email,
      name: account.name,
      athlxBalance: account.athlxBalance,
      metaMaskAddress: demoSessionId,
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
    const demoSessionId = getOrCreateDemoSessionId(storage);

    const loggedInUser: User = {
      id: newAccount.id,
      email: newAccount.email,
      name: newAccount.name,
      athlxBalance: newAccount.athlxBalance,
      metaMaskAddress: demoSessionId,
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
    const address = getOrCreateDemoSessionId();
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

    void fetch('/api/fees/ops3', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta: subtotal * 0.03 }),
    }).catch((error) => {
      console.error('Failed to increment ops fee total', error);
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

  // ✅ Approve -> localStorage (demo)
  const approveAthlete = async (pendingId: string, finalCategory: string, _initialPrice: number, symbol: string) => {
    const pending = state.pendingAthletes.find((p) => p.id === pendingId);
    if (!pending) return;

    const normalizedCategory = finalCategory as Category;
    const safeId = `athlete_${(crypto as any)?.randomUUID?.() ?? Date.now()}`;

    // ✅ 初期価格は全員共通で 0.01
    const unitCost = getCategoryBasePrice(normalizedCategory);

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
      unitCostOverride: false,

      // ActivityIndexは価格とは別軸（初期はカテゴリで差をつけてもOK）
      activityIndex: 0,

      price24hChange: 0,
      price7dChange: 0,
      tradingVolume: 0,
      holders: 0,
      tags: ['New'],
      priceHistory: [{ time: new Date().toISOString(), price: unitCost, volume: 0 }],
      createdAt: new Date().toISOString(),
      userId: pending.userId,
    };

    const nextCatalog = normalizeAthletes([...state.athletes, newAthlete]);

    const response = await fetch('/api/catalog/athletes', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(newAthlete),
    });

    if (!response.ok) {
      throw new Error(`Failed to add athlete (${response.status})`);
    }

    const serverCatalog = await fetchCatalog().catch(() => normalizeAthletes(nextCatalog));

    setState((prev) => ({
      ...prev,
      athletes: normalizeAthletes(serverCatalog),
      pendingAthletes: prev.pendingAthletes.map((p) =>
        p.id === pendingId ? { ...p, status: 'approved' as const } : p,
      ),
      currentUser:
        prev.currentUser?.id === pending.userId
          ? { ...prev.currentUser, linkedAthleteId: newAthlete.id }
          : prev.currentUser,
    }));

    if (pending.userId && state.currentUser?.id === pending.userId) {
      persistCurrentAccount(state.currentUser.email, (account) => ({ ...account, linkedAthleteId: newAthlete.id }));
    }

    logEvent('admin_approve', { userId: pending.userId, athleteSymbol: newAthlete.symbol });
  };

  const deleteAthlete = async (symbol: string) => {
    const targetSymbol = symbol.toUpperCase();
    const response = await fetch('/api/catalog/athletes', {
      method: 'DELETE',
      headers: getAdminHeaders(),
      body: JSON.stringify({ symbol: targetSymbol }),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete athlete (${response.status})`);
    }

    const nextCatalog = await fetchCatalog();

    setState((prev) => ({
      ...prev,
      athletes: nextCatalog,
    }));

    logEvent('admin_delete', { athleteSymbol: targetSymbol });
  };

  const updateAthlete = async (symbol: string, patch: Partial<Athlete>) => {
    const targetSymbol = symbol.toUpperCase();
    const response = await fetch('/api/catalog/athletes', {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify({ ...patch, symbol: targetSymbol }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update athlete (${response.status})`);
    }

    const nextCatalog = await fetchCatalog();

    setState((prev) => ({
      ...prev,
      athletes: nextCatalog,
    }));

    logEvent('admin_edit', { athleteSymbol: targetSymbol });
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

  const getAthleteBySymbol = (symbol: string): Athlete | undefined =>
    state.athletes.find((a) => a.symbol === symbol);

  const updateAthletePrice = (symbol: string, newPrice: number) => {
    setState((prev) => ({
      ...prev,
      athletes: prev.athletes.map((a) => {
        if (a.symbol !== symbol) return a;
        const base = a.currentPrice || getCategoryBasePrice(a.category);
        const next = clampPrice(newPrice);
        const change24h = ((next - base) / base) * 100;
        return {
          ...a,
          currentPrice: next,
          unitCost: next,
          unitCostOverride: true,
          price24hChange: change24h,
          priceHistory: [...(a.priceHistory ?? []), { time: new Date().toISOString(), price: next, volume: 0 }],
        };
      }),
    }));
  };

  /**
   * ✅ Match Update: デモ価格は固定（疑似マーケットで別途算出）
   */
  const submitMatchUpdate = (
    athleteSymbol: string,
    nextMatch?: NextMatchInfo,
    lastMatch?: LastMatchInfo,
    approved = true,
  ) => {
    setState((prev) => ({
      ...prev,
      athletes: prev.athletes.map((athlete) => {
        if (athlete.symbol !== athleteSymbol) return athlete;

        const updateScore = computeEventScore(nextMatch, lastMatch);

        // Activityは大きく動いてOK
        const updatedActivityIndex = approved ? Math.max(0, athlete.activityIndex + updateScore) : athlete.activityIndex;

        return {
          ...athlete,
          nextMatch,
          lastMatch,
          activityIndex: updatedActivityIndex,
          lastUpdateReason: approved ? buildUpdateReason(nextMatch, lastMatch) : athlete.lastUpdateReason,
        };
      }),
    }));
  };

  /**
   * ✅ Performance Update: 価格は固定（疑似マーケットで別途算出）
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
    setState((prev) => {
      const targetAthlete = prev.athletes.find((athlete) => athlete.symbol === payload.athleteSymbol);
      if (!targetAthlete) return prev;

      const minutesPlayed = Math.max(0, Math.min(90, Number(payload.minutesPlayed) || 0));
      const goals = Math.max(0, Math.min(10, Number(payload.goals) || 0));
      const assists = Math.max(0, Math.min(10, Number(payload.assists) || 0));

      const resultDelta = payload.result === 'Win' ? 1 : payload.result === 'Draw' ? 0.3 : -0.8;

      const baseDelta =
        (minutesPlayed / 90) * 0.8 +
        goals * 1.2 +
        assists * 0.8 +
        resultDelta +
        (payload.injury ? -2.0 : 0);

      const updatedActivityIndex = Math.max(0, targetAthlete.activityIndex + baseDelta);
      const base =
        typeof targetAthlete.currentPrice === 'number' && targetAthlete.currentPrice > 0
          ? targetAthlete.currentPrice
          : getCategoryBasePrice(targetAthlete.category);
      const updatedUnitCost = clampPrice(base);

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

      return {
        ...prev,
        athletes: prev.athletes.map((athlete) => {
          if (athlete.symbol !== payload.athleteSymbol) return athlete;
          return {
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
            lastUpdateReason: updateReason,
          };
        }),
        athleteUpdates: [...prev.athleteUpdates, updateRecord],
      };
    });

    logEvent('athlete_update_submit', { userId: state.currentUser?.id, athleteSymbol: payload.athleteSymbol });
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
  };

  const setAdminAccess = (value: boolean) => {
    setState((prev) => ({ ...prev, isAdmin: value }));
    if (!value) adminPinRef.current = null;
  };

  const setAdminPin = (pin: string | null) => {
    adminPinRef.current = pin;
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
        deleteAthlete,
        updateAthlete,
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
