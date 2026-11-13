import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/ApiError.js';

// Toggle like: 1 user hanya 1 like per post (dijaga juga oleh UNIQUE(user_id, post_id)).
export async function toggle(userId, postId) {
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) throw ApiError.notFound('Postingan tidak ditemukan');

  const key = { userId_postId: { userId, postId } };
  const existing = await prisma.like.findUnique({ where: key });

  if (existing) {
    await prisma.like.deleteMany({ where: { userId, postId } });
  } else {
    try {
      await prisma.like.create({ data: { userId, postId } });
    } catch (err) {
      if (err.code !== 'P2002') throw err; // klik ganda bersamaan: abaikan duplikat
    }
  }

  const [liked, likesCount] = await Promise.all([
    prisma.like.findUnique({ where: key }).then(Boolean),
    prisma.like.count({ where: { postId } }),
  ]);
  return { liked, likesCount };
}
