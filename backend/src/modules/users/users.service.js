import bcrypt from 'bcrypt';
import { env } from '../../config/env.js';
import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { removeLocalFile, resolveImage } from '../../utils/files.js';
import { toPublicUser } from '../../utils/serializers.js';

export async function getPublicProfile(userId) {
  const profile = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      avatar: true,
      bio: true,
      createdAt: true,
    },
  });

  if (!profile) {
    throw ApiError.notFound('Profil tidak ditemukan');
  }

  return profile;
}

export async function updateProfile(user, { name, bio, avatarUrl }, file) {
  const newAvatar = resolveImage(file, avatarUrl);
  const avatar = newAvatar || user.avatar; // tanpa input baru, foto lama dipertahankan

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { name, bio: bio || null, avatar },
  });

  if (newAvatar && newAvatar !== user.avatar) await removeLocalFile(user.avatar);
  return toPublicUser(updated);
}

export async function changePassword(user, { oldPassword, newPassword }) {
  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) {
    throw ApiError.unprocessable('Password lama salah', [{ field: 'oldPassword', message: 'Password lama salah' }]);
  }
  if (oldPassword === newPassword) {
    throw ApiError.unprocessable('Password baru tidak boleh sama dengan password lama', [
      { field: 'newPassword', message: 'Password baru tidak boleh sama dengan password lama' },
    ]);
  }

  const hash = await bcrypt.hash(newPassword, env.bcryptRounds);
  await prisma.user.update({ where: { id: user.id }, data: { password: hash } });
}
