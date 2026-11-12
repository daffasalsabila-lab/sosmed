import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/response.js';
import { toPublicUser } from '../../utils/serializers.js';
import * as service from './auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const data = await service.register(req.body);
  sendSuccess(res, data, 'Registrasi berhasil', 201);
});

export const login = asyncHandler(async (req, res) => {
  const data = await service.login(req.body);
  sendSuccess(res, data, 'Login berhasil');
});

export const me = asyncHandler(async (req, res) => {
  sendSuccess(res, { user: toPublicUser(req.user) });
});

// Token bersifat stateless: sesi dihancurkan di klien (token dihapus). Endpoint ini
// memvalidasi sesi lalu mengonfirmasi logout.
export const logout = asyncHandler(async (req, res) => {
  sendSuccess(res, null, 'Logout berhasil');
});
