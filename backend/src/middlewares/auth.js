import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyToken } from '../utils/jwt.js';

// Auth guard: wajib punya token valid & user masih ada di database.
export const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) throw ApiError.unauthorized('Silakan login terlebih dahulu');

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw ApiError.unauthorized('Sesi tidak valid atau sudah berakhir, silakan login kembali');
  }

  const user = await prisma.user.findUnique({ where: { id: Number(payload.sub) } });
  if (!user) throw ApiError.unauthorized('Akun tidak ditemukan, silakan login kembali');

  req.user = user;
  next();
});
