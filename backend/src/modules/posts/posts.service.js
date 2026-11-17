
import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { removeLocalFile, resolveImage } from '../../utils/files.js';
import { userSelect } from '../../utils/serializers.js';
import { deleteCommentsBottomUp } from '../comments/commentTree.js';

const includeFor = (viewerId) => ({
  user: { select: userSelect },
  _count: { select: { likes: true, comments: true } },
  likes: {
    where: { userId: viewerId },
    select: { id: true },
    take: 1,
  },
});

export const toPostDto = (p) => ({
  id: p.id,
  content: p.content,
  image: p.image,
  latitude: p.latitude,
  longitude: p.longitude,
  locationName: p.locationName,
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
  user: p.user,
  likesCount: p._count.likes,
  commentsCount: p._count.comments,
  likedByMe: p.likes.length > 0,
});

// ==============================
// MENAMPILKAN SEMUA POSTINGAN
// ==============================
export async function list(viewerId, { page, limit, userId }) {
  const rows = await prisma.post.findMany({
    where: userId ? { userId } : undefined,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    skip: (page - 1) * limit,
    take: limit + 1,
    include: includeFor(viewerId),
  });

  const hasMore = rows.length > limit;

  return {
    posts: rows.slice(0, limit).map(toPostDto),
    hasMore,
  };
}

// ==============================
// MEMBUAT POSTINGAN
// ==============================
export async function create(user, { content, imageUrl, latitude, longitude, locationName }, file) {
  const image = resolveImage(file, imageUrl);
  const text = content?.trim() || null;

  if (!text && !image) {
    throw ApiError.unprocessable(
      'Status tidak boleh kosong: isi teks atau lampirkan gambar',
      [
        {
          field: 'content',
          message: 'Isi teks atau lampirkan gambar',
        },
      ]
    );
  }

  const post = await prisma.post.create({
    data: {
      userId: user.id,
      content: text,
      image,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      locationName: locationName?.trim() || null,
    },
    include: includeFor(user.id),
  });

  return toPostDto(post);
}

// ==============================
// MENGEDIT POSTINGAN
// ==============================
export async function update(user, postId, body, file) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw ApiError.notFound('Postingan tidak ditemukan');
  }

  // Hanya pemilik postingan yang boleh mengedit.
  if (post.userId !== user.id) {
    throw ApiError.forbidden(
      'Anda hanya dapat mengedit postingan milik sendiri'
    );
  }

  // Jika content tidak dikirim, pertahankan teks lama.
  const text = Object.hasOwn(body, 'content')
    ? body.content?.trim() || null
    : post.content;

  // Pertahankan gambar lama jika tidak ada perubahan gambar.
  let image = post.image;
  let latitude = post.latitude;
  let longitude = post.longitude;
  let locationName = post.locationName;

  if (file) {
    image = resolveImage(file, null);
  } else if (Object.hasOwn(body, 'imageUrl')) {
    image = body.imageUrl?.trim() || null;
  }

  if (body.removeLocation) {
    latitude = null;
    longitude = null;
    locationName = null;
  } else if (Object.hasOwn(body, 'latitude') && Object.hasOwn(body, 'longitude')) {
    latitude = body.latitude;
    longitude = body.longitude;
    locationName = body.locationName?.trim() || null;
  }

  // Postingan tidak boleh kosong.
  if (!text && !image) {
    throw ApiError.unprocessable(
      'Postingan tidak boleh kosong: isi teks atau lampirkan gambar'
    );
  }

  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: {
      content: text,
      image,
      latitude,
      longitude,
      locationName,
      updatedAt: new Date(),
    },
    include: includeFor(user.id),
  });

  // Hapus gambar lama jika diganti atau dihapus.
  if (post.image && post.image !== image) {
    await removeLocalFile(post.image);
  }

  return toPostDto(updatedPost);
}

// ==============================
// MENGHAPUS POSTINGAN
// ==============================
export async function remove(user, postId) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      comments: {
        select: { id: true, parentId: true, image: true },
      },
    },
  });

  if (!post) {
    throw ApiError.notFound('Postingan tidak ditemukan');
  }

  // Hanya pemilik postingan yang boleh menghapus.
  if (post.userId !== user.id) {
    throw ApiError.forbidden(
      'Anda hanya dapat menghapus postingan milik sendiri'
    );
  }

  // Hapus postingan. Likes dan comments ikut terhapus karena CASCADE.
  await prisma.$transaction(async (transaction) => {
    await deleteCommentsBottomUp(transaction, post.comments);
    await transaction.post.delete({
      where: { id: postId },
    });
  });

  // Hapus gambar postingan dan gambar komentar yang terkait.
  await Promise.all(
    [post.image, ...post.comments.map((c) => c.image)].map(removeLocalFile)
  );
}


// edit dan delete
