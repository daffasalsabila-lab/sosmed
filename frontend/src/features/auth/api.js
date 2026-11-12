import { http } from '@/lib/http';

export const loginRequest = (payload) => http.post('/auth/login', payload).then((r) => r.data.data);
export const registerRequest = (payload) => http.post('/auth/register', payload).then((r) => r.data.data);
export const meRequest = () => http.get('/auth/me').then((r) => r.data.data.user);
export const logoutRequest = () => http.post('/auth/logout').then((r) => r.data);
