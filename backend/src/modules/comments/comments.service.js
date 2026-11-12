import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { resolveImage } from '../../utils/files.js';
import { userSelect } from '../../utils/serializers.js';

const select = {
  id: true,
  postId: true,
  comment: true,
  image: true,
  createdAt: true,
  user: { select: userSelect },
};

async function assertPostExists(postId) {
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) throw ApiError.notFound('Postingan tidak ditemukan');
}

export async function list(postId) {
  await assertPostExists(postId);
  return prisma.comment.findMany({
    where: { postId },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    select,
  });
}

export async function create(user, postId, { comment, imageUrl }, file) {
  await assertPostExists(postId);

  const image = resolveImage(file, imageUrl);
  const text = comment?.trim() || null;
  if (!text && !image) {
    throw ApiError.unprocessable('Komentar tidak boleh kosong: isi teks atau lampirkan gambar', [
      { field: 'comment', message: 'Isi komentar atau lampirkan gambar' },
    ]);
  }

  return prisma.comment.create({ data: { postId, userId: user.id, comment: text, image }, select });
}
