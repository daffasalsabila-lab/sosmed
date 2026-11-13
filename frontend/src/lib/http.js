import axios from 'axios';
import { tokenStorage } from '@/lib/storage';

export const AUTH_EXPIRED_EVENT = 'auth:expired';

export const http = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

http.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || '';
    const isAuthForm = url.startsWith('/auth/login') || url.startsWith('/auth/register');
    if (err.response?.status === 401 && !isAuthForm) {
      tokenStorage.clear();
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    return Promise.reject(err);
  },
);

export const getErrorMessage = (err, fallback = 'Terjadi kesalahan, coba lagi') =>
  err?.response?.data?.message || (err?.request ? 'Tidak dapat terhubung ke server' : fallback);

// Tempelkan pesan error dari server (Joi) ke field React Hook Form.
export function applyServerErrors(err, setError) {
  const list = err?.response?.data?.errors;
  if (!Array.isArray(list)) return;
  list.forEach(({ field, message }) => field && setError(field, { type: 'server', message }));
}

// Alamat gambar: URL eksternal dipakai apa adanya, path lokal (/uploads/..) diprefiks.
export const assetUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${import.meta.env.VITE_ASSET_URL || ''}${path}`;
};
