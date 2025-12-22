'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  AppState,
  User,
  Athlete,
  Trade,
  Portfolio,
  PendingAthlete,
  Category,
  NextMatchInfo,
  LastMatchInfo,
  AthleteUpdate,
  MatchHomeAway,
  MatchResult
} from './types';
import { initialAthletes, initialNews } from './data';
import { buildUpdateReason, computeEventScore } from './match';
import { translations } from './translations';
import { EVENTS_KEY, logEvent } from './analytics';
import {
  authenticateAccount,
  clearSession,
  createAccount,
  loadAccounts,
  loadSession,
  resetDemoStorage,
  saveSession,
  updateAccount,
  StoredAccount
} from './demoAccountStorage';

const STORAGE_KEY = 'athlx_state';

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

const defaultState: AppState = {
  currentUser: null,
  athletes: initialAthletes,
  pendingAthletes: [],
  trades: [],
  athleteUpdates: [],
  news: initialNews,
  language: 'EN',
  isAdmin: false
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
  approveAthlete: (pendingId: string, finalCategory: string, initialPrice: number, symbol: string) => void;
  rejectAthlete: (pendingId: string, reason: string) => void;
  getAthleteBySymbol: (symbol: string) => Athlete | undefined;
  updateAthletePrice: (symbol: string, newPrice: number) => void;
  submitMatchUpdate: (
    athleteSymbol: string,
    nextMatch?: NextMatchInfo,
    lastMatch?: LastMatchInfo,
    approved?: boolean
  ) => void;
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
  setLanguage: (lang: 'EN' | 'ES') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(defaultState);
  const [isHydrated, setIsHydrated] = useState(false);

  const buildPortfolioFromTrades = (trades: Trade[], athletes: Athlete[]): Portfolio[] => {
    const portfolioMap = new Map<string, Portfolio>();

    trades.forEach(trade => {
      const existing = portfolioMap.get(trade.athleteSymbol);

      if (trade.type === 'buy') {
        if (existing) {
          const totalQuantity = existing.quantity + trade.quantity;
          const totalCost = (existing.avgBuyPrice * existing.quantity) + (trade.price * trade.quantity);
          portfolioMap.set(trade.athleteSymbol, {
            ...existing,
            quantity: totalQuantity,
            avgBuyPrice: totalCost / totalQuantity
          });
        } else {
          portfolioMap.set(trade.athleteSymbol, {
            athleteSymbol: trade.athleteSymbol,
            athleteName: trade.athleteName,
            quantity: trade.quantity,
            avgBuyPrice: trade.price,
            currentPrice: trade.price
          });
        }
      } else if (existing) {
        const newQuantity = existing.quantity - trade.quantity;
        if (newQuantity > 0) {
          portfolioMap.set(trade.athleteSymbol, {
            ...existing,
            quantity: newQuantity
          });
        } else {
          portfolioMap.delete(trade.athleteSymbol);
        }
      }
    });

    return Array.from(portfolioMap.values()).map(portfolio => {
      const athlete = athletes.find(a => a.symbol === portfolio.athleteSymbol);
      return {
        ...portfolio,
        currentPrice: athlete?.unitCost || portfolio.currentPrice
      };
    });
  };

  const persistCurrentAccount = (email: string, updater: (account: StoredAccount) => StoredAccount) => {
    updateAccount(localStorage, email, updater);
  };

  // Load state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedUser = loadSession(localStorage);
    let persistedState = defaultState;

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const hydratedAthletes = (parsed.athletes ?? defaultState.athletes).map((athlete: Athlete) => ({
          ...athlete,
          unitCost: athlete.unitCost && athlete.unitCost > 0
            ? athlete.unitCost
            : getDefaultUnitCost(athlete.category)
        }));
        persistedState = { ...defaultState, ...parsed, athletes: hydratedAthletes };
      } catch (e) {
        console.error('Failed to parse stored state', e);
      }
    }

    if (storedUser?.email) {
      const accounts = loadAccounts(localStorage);
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
            linkedAthleteId: account.linkedAthleteId
          },
          trades: account.trades ?? []
        };
      }
    }

    setState({ ...persistedState, isAdmin: false });
    setIsHydrated(true);
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isHydrated]);

  const login = async (email: string, password: string): Promise<User> => {
    // Simple demo authentication
    const account = authenticateAccount(localStorage, { email, password });

    if (account) {
      const loggedInUser: User = {
        id: account.id,
        email: account.email,
        name: account.name,
        athlxBalance: account.athlxBalance,
        metaMaskAddress: undefined,
        linkedAthleteId: account.linkedAthleteId
      };

      setState(prev => ({
        ...prev,
        currentUser: loggedInUser,
        trades: account.trades ?? []
      }));
      saveSession(localStorage, account.email);
      logEvent('login', { userId: account.id });
      return loggedInUser;
    }
    
    throw new Error('Invalid credentials');
  };

  const signup = async (email: string, password: string, name: string): Promise<User> => {
    const newAccount = createAccount(localStorage, { email, password, name });
    
    const loggedInUser: User = {
      id: newAccount.id,
      email: newAccount.email,
      name: newAccount.name,
      athlxBalance: newAccount.athlxBalance,
      metaMaskAddress: undefined,
      linkedAthleteId: undefined
    };
    
    setState(prev => ({ ...prev, currentUser: loggedInUser, trades: [] }));
    saveSession(localStorage, loggedInUser.email);
    logEvent('signup', { userId: loggedInUser.id });
    return loggedInUser;
  };

  const logout = () => {
    setState(prev => ({ ...prev, currentUser: null, trades: [], isAdmin: false }));
    clearSession(localStorage);
  };

  const connectMetaMask = () => {
    if (state.currentUser) {
      const address = `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`;
      setState(prev => ({
        ...prev,
        currentUser: prev.currentUser ? { ...prev.currentUser, metaMaskAddress: address } : null
      }));
    }
  };

  const disconnectMetaMask = () => {
    if (state.currentUser) {
      setState(prev => ({
        ...prev,
        currentUser: prev.currentUser ? { ...prev.currentUser, metaMaskAddress: undefined } : null
      }));
    }
  };

  const executeTrade = (athleteSymbol: string, type: 'buy' | 'sell', quantity: number, price: number) => {
    if (!state.currentUser) return;
    const linkedAthlete = state.currentUser.linkedAthleteId
      ? state.athletes.find(a => a.id === state.currentUser?.linkedAthleteId)
      : null;
    if (linkedAthlete) {
      const t = translations[state.language];
      throw new Error(t.cannotTradeOwnUnits);
    }

    const subtotal = quantity * price;
    const fee = subtotal * 0.05;
    const total = type === 'buy' ? subtotal + fee : subtotal - fee;

    // Update user balance
    const newBalance = type === 'buy' 
      ? state.currentUser.athlxBalance - total
      : state.currentUser.athlxBalance + total;

    if (type === 'buy' && newBalance < 0) {
      throw new Error('Insufficient balance');
    }

    const athlete = state.athletes.find(a => a.symbol === athleteSymbol);
    if (!athlete) return;

    // Create trade record
    const trade: Trade = {
      id: `trade_${Date.now()}`,
      userId: state.currentUser.id,
      athleteSymbol,
      athleteName: athlete.name,
      type,
      quantity,
      price,
      fee,
      total,
      timestamp: new Date().toISOString()
    };

    // Update athlete stats
    const updatedAthletes = state.athletes.map(a => {
      if (a.symbol === athleteSymbol) {
        return {
          ...a,
          tradingVolume: a.tradingVolume + subtotal,
          holders: type === 'buy' ? a.holders + 1 : Math.max(a.holders - 1, 0)
        };
      }
      return a;
    });

    const updatedTrades = [...state.trades, trade];

    setState(prev => ({
      ...prev,
      currentUser: prev.currentUser ? { ...prev.currentUser, athlxBalance: newBalance } : null,
      trades: updatedTrades,
      athletes: updatedAthletes
    }));

    persistCurrentAccount(state.currentUser.email, account => {
      const updatedPortfolio = buildPortfolioFromTrades(updatedTrades, updatedAthletes);
      return {
        ...account,
        athlxBalance: newBalance,
        trades: updatedTrades,
        portfolio: updatedPortfolio
      };
    });

    logEvent(type === 'buy' ? 'trade_buy' : 'trade_sell', {
      userId: state.currentUser.id,
      athleteSymbol
    });
  };

  const getPortfolio = (): Portfolio[] => {
    if (!state.currentUser) return [];

    const userTrades = state.trades.filter(t => t.userId === state.currentUser!.id);
    const portfolioMap = new Map<string, Portfolio>();

    userTrades.forEach(trade => {
      const existing = portfolioMap.get(trade.athleteSymbol);
      
      if (trade.type === 'buy') {
        if (existing) {
          const totalQuantity = existing.quantity + trade.quantity;
          const totalCost = (existing.avgBuyPrice * existing.quantity) + (trade.price * trade.quantity);
          portfolioMap.set(trade.athleteSymbol, {
            ...existing,
            quantity: totalQuantity,
            avgBuyPrice: totalCost / totalQuantity
          });
        } else {
          portfolioMap.set(trade.athleteSymbol, {
            athleteSymbol: trade.athleteSymbol,
            athleteName: trade.athleteName,
            quantity: trade.quantity,
            avgBuyPrice: trade.price,
            currentPrice: trade.price
          });
        }
      } else {
        if (existing) {
          const newQuantity = existing.quantity - trade.quantity;
          if (newQuantity > 0) {
            portfolioMap.set(trade.athleteSymbol, {
              ...existing,
              quantity: newQuantity
            });
          } else {
            portfolioMap.delete(trade.athleteSymbol);
          }
        }
      }
    });

    // Update current prices
    const portfolio = Array.from(portfolioMap.values()).map(p => {
      const athlete = state.athletes.find(a => a.symbol === p.athleteSymbol);
      return {
        ...p,
        currentPrice: athlete?.unitCost || p.currentPrice
      };
    });

    return portfolio;
  };

  const submitAthleteRegistration = (data: Omit<PendingAthlete, 'id' | 'userId' | 'submittedAt' | 'status'>) => {
    if (!state.currentUser) return;

    const pending: PendingAthlete = {
      ...data,
      id: `pending_${Date.now()}`,
      userId: state.currentUser.id,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };

    setState(prev => ({
      ...prev,
      pendingAthletes: [...prev.pendingAthletes, pending]
    }));
    logEvent('athlete_register_submit', { userId: state.currentUser.id });
  };

  const approveAthlete = (pendingId: string, finalCategory: string, initialPrice: number, symbol: string) => {
    const pending = state.pendingAthletes.find(p => p.id === pendingId);
    if (!pending) return;

    const newAthlete: Athlete = {
      id: `athlete_${Date.now()}`,
      name: pending.name,
      symbol: symbol.toUpperCase(),
      sport: pending.sport,
      category: finalCategory as any,
      nationality: pending.nationality,
      team: pending.team,
      position: pending.position,
      age: new Date().getFullYear() - new Date(pending.dateOfBirth).getFullYear(),
      height: '1.75m',
      bio: pending.bio,
      profileUrl: pending.profileUrl,
      highlightVideoUrl: pending.highlightVideoUrl,
      imageUrl: pending.imageDataUrl ?? `https://i.pravatar.cc/300?img=${Math.floor(Math.random() * 70)}`,
      unitCost: getDefaultUnitCost(finalCategory as Category),
      currentPrice: initialPrice,
      activityIndex: initialPrice,
      price24hChange: 0,
      price7dChange: 0,
      tradingVolume: 0,
      holders: 0,
      tags: ['New'],
      priceHistory: [{ time: new Date().toISOString(), price: initialPrice, volume: 0 }],
      createdAt: new Date().toISOString(),
      userId: pending.userId
    };

    setState(prev => ({
      ...prev,
      athletes: [...prev.athletes, newAthlete],
      pendingAthletes: prev.pendingAthletes.map(p => 
        p.id === pendingId ? { ...p, status: 'approved' as const } : p
      ),
      currentUser: prev.currentUser?.id === pending.userId 
        ? { ...prev.currentUser, linkedAthleteId: newAthlete.id }
        : prev.currentUser
    }));

    if (pending.userId && state.currentUser?.id === pending.userId) {
      persistCurrentAccount(state.currentUser.email, account => ({
        ...account,
        linkedAthleteId: newAthlete.id
      }));
    }

    logEvent('admin_approve', { userId: pending.userId, athleteSymbol: newAthlete.symbol });
  };

  const rejectAthlete = (pendingId: string, reason: string) => {
    setState(prev => ({
      ...prev,
      pendingAthletes: prev.pendingAthletes.map(p =>
        p.id === pendingId ? { ...p, status: 'rejected' as const, rejectionReason: reason } : p
      )
    }));
    logEvent('admin_reject', { userId: state.currentUser?.id });
  };

  const getAthleteBySymbol = (symbol: string): Athlete | undefined => {
    return state.athletes.find(a => a.symbol === symbol);
  };

  const updateAthletePrice = (symbol: string, newPrice: number) => {
    setState(prev => ({
      ...prev,
      athletes: prev.athletes.map(a => {
        if (a.symbol === symbol) {
          const change24h = ((newPrice - a.currentPrice) / a.currentPrice) * 100;
          return {
            ...a,
            currentPrice: newPrice,
            price24hChange: change24h,
            priceHistory: [
              ...a.priceHistory,
              { time: new Date().toISOString(), price: newPrice, volume: Math.floor(Math.random() * 10000) }
            ]
          };
        }
        return a;
      })
    }));
  };

  const submitMatchUpdate = (
    athleteSymbol: string,
    nextMatch?: NextMatchInfo,
    lastMatch?: LastMatchInfo,
    approved = true
  ) => {
    setState(prev => ({
      ...prev,
      athletes: prev.athletes.map(athlete => {
        if (athlete.symbol !== athleteSymbol) {
          return athlete;
        }

        const updateScore = computeEventScore(nextMatch, lastMatch);
        const updatedActivityIndex = approved
          ? Math.max(0, athlete.activityIndex + updateScore)
          : athlete.activityIndex;
        const updatedUnitCost = approved
          ? Math.max(getDefaultUnitCost(athlete.category), athlete.unitCost + updateScore * 0.01)
          : athlete.unitCost;
        return {
          ...athlete,
          nextMatch,
          lastMatch,
          activityIndex: updatedActivityIndex,
          unitCost: updatedUnitCost,
          lastUpdateReason: approved ? buildUpdateReason(nextMatch, lastMatch) : athlete.lastUpdateReason,
          priceHistory: approved
            ? [
                ...athlete.priceHistory,
                { time: new Date().toISOString(), price: updatedActivityIndex, volume: 0 }
              ]
            : athlete.priceHistory
        };
      })
    }));
  };

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
    setState(prev => {
      const targetAthlete = prev.athletes.find(athlete => athlete.symbol === payload.athleteSymbol);
      if (!targetAthlete) {
        return prev;
      }
      const minutesPlayed = Math.max(0, Math.min(90, Number(payload.minutesPlayed) || 0));
      const goals = Math.max(0, Math.min(10, Number(payload.goals) || 0));
      const assists = Math.max(0, Math.min(10, Number(payload.assists) || 0));
      const resultDelta = payload.result === 'Win' ? 0.4 : payload.result === 'Draw' ? 0.1 : -0.2;
      const baseDelta = (minutesPlayed / 90) * 0.5
        + goals * 0.8
        + assists * 0.5
        + resultDelta
        + (payload.injury ? -1.0 : 0);
      const noise = (Math.random() * 0.02) - 0.01;
      const updatedUnitCost = Math.min(
        5,
        Math.max(0.001, targetAthlete.unitCost * (1 + baseDelta / 10 + noise))
      );
      const updatedActivityIndex = Math.max(0, targetAthlete.activityIndex + baseDelta);
      const minutesBucket = minutesPlayed >= 61 ? '61-90' : minutesPlayed >= 31 ? '31-60' : minutesPlayed >= 1 ? '1-30' : '0';
      const updateReason = payload.notes || buildUpdateReason(undefined, {
        date: payload.matchDate,
        minutesBucket,
        result: payload.result,
        goals: goals || undefined,
        assists: assists || undefined,
        injury: payload.injury
      });

      return {
        ...prev,
        athletes: prev.athletes.map(athlete => {
          if (athlete.symbol !== payload.athleteSymbol) {
            return athlete;
          }
          return {
            ...athlete,
            lastMatch: {
              date: payload.matchDate,
              minutesBucket,
              result: payload.result,
              goals: goals || undefined,
              assists: assists || undefined,
              injury: payload.injury
            },
            activityIndex: updatedActivityIndex,
            unitCost: updatedUnitCost,
            lastUpdateReason: updateReason,
            priceHistory: [
              ...athlete.priceHistory,
              { time: new Date().toISOString(), price: updatedUnitCost, volume: Math.floor(Math.random() * 10000) }
            ]
          };
        }),
        athleteUpdates: [
          ...prev.athleteUpdates,
          {
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
            newActivityIndex: updatedActivityIndex
          }
        ]
      };
    });
    logEvent('athlete_update_submit', {
      userId: state.currentUser?.id,
      athleteSymbol: payload.athleteSymbol
    });
  };

  const resetDemoData = () => {
    if (!state.isAdmin) {
      const t = translations[state.language];
      throw new Error(t.adminOnly);
    }
    logEvent('reset', { userId: state.currentUser?.id });
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(EVENTS_KEY);
    resetDemoStorage(localStorage);
    setState(defaultState);
  };

  const setAdminAccess = (value: boolean) => {
    setState(prev => ({ ...prev, isAdmin: value }));
  };

  const setLanguage = (lang: 'EN' | 'ES') => {
    setState(prev => ({ ...prev, language: lang }));
  };

  return (
    <StoreContext.Provider value={{
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
      setLanguage
    }}>
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
