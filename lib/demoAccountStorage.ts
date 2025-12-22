import { Portfolio, Trade } from './types';

const USERS_KEY = 'athlx_users';
const CURRENT_USER_KEY = 'athlx_currentUser';
const DEFAULT_DEMO_BALANCE = 10000;

export type StoredAccount = {
  id: string;
  email: string;
  password: string;
  name: string;
  athlxBalance: number;
  trades: Trade[];
  portfolio: Portfolio[];
  linkedAthleteId?: string;
};

export type DemoStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export const loadAccounts = (storage: DemoStorage): Record<string, StoredAccount> => {
  const storedUsers = storage.getItem(USERS_KEY);
  if (!storedUsers) return {};

  try {
    const parsed = JSON.parse(storedUsers);
    if (Array.isArray(parsed)) {
      return parsed.reduce<Record<string, StoredAccount>>((acc, user) => {
        if (!user.email) return acc;
        acc[user.email] = {
          id: user.id ?? `user_${Date.now()}`,
          email: user.email,
          password: user.password ?? '',
          name: user.name ?? '',
          athlxBalance: user.athlxBalance ?? DEFAULT_DEMO_BALANCE,
          trades: user.trades ?? [],
          portfolio: user.portfolio ?? [],
          linkedAthleteId: user.linkedAthleteId
        };
        return acc;
      }, {});
    }
    return parsed ?? {};
  } catch (error) {
    console.error('Failed to parse stored users', error);
    return {};
  }
};

export const saveAccounts = (storage: DemoStorage, accounts: Record<string, StoredAccount>) => {
  storage.setItem(USERS_KEY, JSON.stringify(accounts));
};

export const createAccount = (
  storage: DemoStorage,
  payload: { email: string; password: string; name: string }
) => {
  const accounts = loadAccounts(storage);
  if (accounts[payload.email]) {
    throw new Error('Email already exists');
  }
  const newAccount: StoredAccount = {
    id: `user_${Date.now()}`,
    email: payload.email,
    password: payload.password,
    name: payload.name,
    athlxBalance: DEFAULT_DEMO_BALANCE,
    trades: [],
    portfolio: []
  };
  accounts[payload.email] = newAccount;
  saveAccounts(storage, accounts);
  return newAccount;
};

export const authenticateAccount = (
  storage: DemoStorage,
  payload: { email: string; password: string }
) => {
  const accounts = loadAccounts(storage);
  const account = accounts[payload.email];
  if (!account || account.password !== payload.password) {
    return null;
  }
  return account;
};

export const updateAccount = (
  storage: DemoStorage,
  email: string,
  updater: (account: StoredAccount) => StoredAccount
) => {
  const accounts = loadAccounts(storage);
  const existing = accounts[email];
  if (!existing) return;
  accounts[email] = updater(existing);
  saveAccounts(storage, accounts);
};

export const saveSession = (storage: DemoStorage, email: string) => {
  storage.setItem(CURRENT_USER_KEY, JSON.stringify({ email }));
};

export const loadSession = (storage: DemoStorage) => {
  const storedUser = storage.getItem(CURRENT_USER_KEY);
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser) as { email: string };
  } catch (error) {
    console.error('Failed to parse stored session', error);
    return null;
  }
};

export const clearSession = (storage: DemoStorage) => {
  storage.removeItem(CURRENT_USER_KEY);
};

export const resetDemoStorage = (storage: DemoStorage) => {
  storage.removeItem(USERS_KEY);
  storage.removeItem(CURRENT_USER_KEY);
};
