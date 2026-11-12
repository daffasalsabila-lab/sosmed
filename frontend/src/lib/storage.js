const KEY = 'connectspace_token';

export const tokenStorage = {
  get: () => {
    try { return localStorage.getItem(KEY); } catch { return null; }
  },
  set: (t) => {
    try { localStorage.setItem(KEY, t); } catch { /* abaikan */ }
  },
  clear: () => {
    try { localStorage.removeItem(KEY); } catch { /* abaikan */ }
  },
};
