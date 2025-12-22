const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const createMemoryStorage = () => {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, value),
    removeItem: (key) => store.delete(key)
  };
};

const USERS_KEY = 'athlx_users';
const CURRENT_USER_KEY = 'athlx_currentUser';
const DEFAULT_DEMO_BALANCE = 10000;

const loadAccounts = (storage) => {
  const raw = storage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : {};
};

const saveAccounts = (storage, accounts) => {
  storage.setItem(USERS_KEY, JSON.stringify(accounts));
};

const signup = (storage, email, password, name) => {
  const accounts = loadAccounts(storage);
  if (accounts[email]) {
    throw new Error('Email already exists');
  }
  accounts[email] = {
    id: `user_${Date.now()}`,
    email,
    password,
    name,
    athlxBalance: DEFAULT_DEMO_BALANCE,
    trades: [],
    portfolio: []
  };
  saveAccounts(storage, accounts);
  storage.setItem(CURRENT_USER_KEY, JSON.stringify({ email }));
  return accounts[email];
};

const login = (storage, email, password) => {
  const accounts = loadAccounts(storage);
  const account = accounts[email];
  if (!account || account.password !== password) {
    throw new Error('Invalid credentials');
  }
  storage.setItem(CURRENT_USER_KEY, JSON.stringify({ email }));
  return account;
};

const logout = (storage) => {
  storage.removeItem(CURRENT_USER_KEY);
};

const updateBalance = (storage, email, newBalance) => {
  const accounts = loadAccounts(storage);
  accounts[email] = { ...accounts[email], athlxBalance: newBalance };
  saveAccounts(storage, accounts);
};

const run = () => {
  const storage = createMemoryStorage();
  const email = 'demo@example.com';
  const password = 'demo-pass';

  const account = signup(storage, email, password, 'Demo User');
  updateBalance(storage, email, account.athlxBalance - 250);
  logout(storage);

  const reloaded = login(storage, email, password);
  assert(reloaded.athlxBalance === account.athlxBalance - 250, 'Demo balance should persist across login');

  console.log('Smoke test passed: demo balance persisted after re-login.');
};

run();
