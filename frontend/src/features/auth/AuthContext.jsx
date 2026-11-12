import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AUTH_EXPIRED_EVENT } from '@/lib/http';
import { tokenStorage } from '@/lib/storage';
import { loginRequest, logoutRequest, meRequest, registerRequest } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(tokenStorage.get()));
  // null | 'logout' | 'expired' -> menentukan notifikasi di halaman login
  const [endReason, setEndReason] = useState(null);

  // Pulihkan sesi dari token saat aplikasi dibuka
  useEffect(() => {
    if (!tokenStorage.get()) return;
    meRequest()
      .then(setUser)
      .catch(() => tokenStorage.clear())
      .finally(() => setLoading(false));
  }, []);

  // Token ditolak server (kadaluarsa/tidak valid) -> sesi dibersihkan
  useEffect(() => {
    const onExpired = () => {
      setUser(null);
      setEndReason('expired');
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  const startSession = useCallback(({ token, user: u }) => {
    tokenStorage.set(token);
    setEndReason(null);
    setUser(u);
    return u;
  }, []);

  const login = useCallback((payload) => loginRequest(payload).then(startSession), [startSession]);

  // Registrasi langsung membuat sesi aktif (auto-login), tanpa melewati form login
  const register = useCallback((payload) => registerRequest(payload).then(startSession), [startSession]);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      /* tetap hancurkan sesi lokal */
    }
    tokenStorage.clear();
    setEndReason('logout');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, endReason, login, register, logout, updateUser: setUser }),
    [user, loading, endReason, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
};
