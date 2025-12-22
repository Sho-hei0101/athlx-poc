'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, User, Athlete, Trade, Portfolio, PendingAthlete, NewsItem, Category } from './types';
import { initialAthletes, initialNews } from './data';

const STORAGE_KEY = 'athlx_state';
const USERS_KEY = 'athlx_users';
const CURRENT_USER_KEY = 'athlx_currentUser';

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
  news: initialNews,
  language: 'EN'
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
  setLanguage: (lang: 'EN' | 'ES') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(defaultState);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
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

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        persistedState = { ...persistedState, currentUser: parsedUser };
      } catch (e) {
        console.error('Failed to parse stored user', e);
      }
    }

    setState(persistedState);
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
    const storedUsers = localStorage.getItem(USERS_KEY);
    let users: { email: string; password: string; name: string; id: string }[] = [];
    
    if (storedUsers) {
      users = JSON.parse(storedUsers);
    }
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      const loggedInUser: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        athlxBalance: 10000,
        metaMaskAddress: undefined,
        linkedAthleteId: undefined
      };
      
      setState(prev => ({ ...prev, currentUser: loggedInUser }));
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(loggedInUser));
      return loggedInUser;
    }
    
    throw new Error('Invalid credentials');
  };

  const signup = async (email: string, password: string, name: string): Promise<User> => {
    const storedUsers = localStorage.getItem(USERS_KEY);
    let users: { email: string; password: string; name: string; id: string }[] = [];
    
    if (storedUsers) {
      users = JSON.parse(storedUsers);
    }
    
    if (users.find(u => u.email === email)) {
      throw new Error('Email already exists');
    }
    
    const newUser = {
      id: `user_${Date.now()}`,
      email,
      password,
      name
    };
    
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    const loggedInUser: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      athlxBalance: 10000,
      metaMaskAddress: undefined,
      linkedAthleteId: undefined
    };
    
    setState(prev => ({ ...prev, currentUser: loggedInUser }));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(loggedInUser));
    return loggedInUser;
  };

  const logout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
    localStorage.removeItem(CURRENT_USER_KEY);
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

    setState(prev => ({
      ...prev,
      currentUser: prev.currentUser ? { ...prev.currentUser, athlxBalance: newBalance } : null,
      trades: [...prev.trades, trade],
      athletes: updatedAthletes
    }));
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
      imageUrl: `https://i.pravatar.cc/300?img=${Math.floor(Math.random() * 70)}`,
      unitCost: getDefaultUnitCost(finalCategory as Category),
      currentPrice: initialPrice,
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
  };

  const rejectAthlete = (pendingId: string, reason: string) => {
    setState(prev => ({
      ...prev,
      pendingAthletes: prev.pendingAthletes.map(p =>
        p.id === pendingId ? { ...p, status: 'rejected' as const, rejectionReason: reason } : p
      )
    }));
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
