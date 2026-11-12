import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { removeLocalFile, resolveImage } from '../../utils/files.js';
import { userSelect } from '../../utils/serializers.js';

const includeFor = (viewerId) => ({
  user: { select: userSelect },
  _count: { select: { likes: true, comments: true } },
  likes: { where: { userId: viewerId }, select: { id: true }, take: 1 },
});

export const toPostDto = (p) => ({
  id: p.id,
  content: p.content,
  image: p.image,
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
  user: p.user,
  likesCount: p._count.likes,
  commentsCount: p._count.comments,
  likedByMe: p.likes.length > 0,
});

export async function list(viewerId, { page, limit }) {
  const rows = await prisma.post.findMany({
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], // terbaru di atas
    skip: (page - 1) * limit,
    take: limit + 1,
    include: includeFor(viewerId),
  });
  const hasMore = rows.length > limit;
  return { posts: rows.slice(0, limit).map(toPostDto), hasMore };
}

export async function create(user, { content, imageUrl }, file) {
  const image = resolveImage(file, imageUrl);
  const text = content?.trim() || null;

  if (!text && !image) {
    throw ApiError.unprocessable('Status tidak boleh kosong: isi teks atau lampirkan gambar', [
      { field: 'content', message: 'Isi teks atau lampirkan gambar' },
    ]);
  }

  const post = await prisma.post.create({
    data: { userId: user.id, content: text, image },
    include: includeFor(user.id),
  });
  return toPostDto(post);
}

export async function remove(user, postId) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { comments: { select: { image: true } } },
  });
  if (!post) throw ApiError.notFound('Postingan tidak ditemukan');
  // Otorisasi: hanya pemilik yang boleh menghapus (divalidasi di server, bukan hanya di UI).
  if (post.userId !== user.id) throw ApiError.forbidden('Anda hanya dapat menghapus postingan milik sendiri');

  await prisma.post.delete({ where: { id: postId } }); // likes & comments ikut terhapus (CASCADE)
  await Promise.all([post.image, ...post.comments.map((c) => c.image)].map(removeLocalFile));
}
