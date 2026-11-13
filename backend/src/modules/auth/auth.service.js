import bcrypt from 'bcrypt';
import { env } from '../../config/env.js';
import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { signToken } from '../../utils/jwt.js';
import { toPublicUser } from '../../utils/serializers.js';

// Hash palsu agar waktu respon login tetap sama saat email tidak ditemukan.
const DUMMY_HASH = bcrypt.hashSync('dummy-password', env.bcryptRounds);

export async function register({ name, email, password }) {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    throw ApiError.conflict('Email sudah terdaftar', [{ field: 'email', message: 'Email sudah terdaftar' }]);
  }

  const hash = await bcrypt.hash(password, env.bcryptRounds);
  const user = await prisma.user.create({ data: { name, email, password: hash } });

  // Auto-login: langsung terbitkan token sesi setelah registrasi tersimpan.
  return { token: signToken(user.id), user: toPublicUser(user) };
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  const valid = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);
  if (!user || !valid) throw ApiError.unauthorized('Email atau password salah');

  return { token: signToken(user.id), user: toPublicUser(user) };
}
