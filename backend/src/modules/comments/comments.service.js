
import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import {
  resolveImage,
  removeLocalFile,
} from '../../utils/files.js';
import { userSelect } from '../../utils/serializers.js';
import { deleteCommentsBottomUp } from './commentTree.js';

const selectFor = (viewerId) => ({
  id: true,
  postId: true,
  parentId: true,
  comment: true,
  image: true,
  latitude: true,
  longitude: true,
  locationName: true,
  createdAt: true,
  updatedAt: true,
  user: { select: userSelect },
  _count: { select: { likes: true } },
  likes: {
    where: { userId: viewerId },
    select: { id: true },
    take: 1,
  },
});

const toCommentDto = (comment) => ({
  id: comment.id,
  postId: comment.postId,
  parentId: comment.parentId,
  comment: comment.comment,
  image: comment.image,
  latitude: comment.latitude,
  longitude: comment.longitude,
  locationName: comment.locationName,
  createdAt: comment.createdAt,
  updatedAt: comment.updatedAt,
  user: comment.user,
  likesCount: comment._count.likes,
  likedByMe: comment.likes.length > 0,
});

// ==================================
// MEMERIKSA APAKAH POSTINGAN ADA
// ==================================
async function assertPostExists(postId) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  if (!post) {
    throw ApiError.notFound('Postingan tidak ditemukan');
  }
}

// ==================================
// MENAMPILKAN KOMENTAR
// ==================================
export async function list(postId, viewerId) {
  await assertPostExists(postId);

  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: [
      { createdAt: 'asc' },
      { id: 'asc' },
    ],
    select: selectFor(viewerId),
  });

  return comments.map(toCommentDto);
}

// ==================================
// MEMBUAT KOMENTAR
// ==================================
export async function create(
  user,
  postId,
  { comment, imageUrl, parentId, latitude, longitude, locationName },
  file,
) {
  await assertPostExists(postId);

  if (parentId) {
    const parent = await prisma.comment.findFirst({
      where: { id: parentId, postId },
      select: { parentId: true },
    });

    if (!parent) {
      throw ApiError.notFound('Komentar yang dibalas tidak ditemukan');
    }
  }

  const image = resolveImage(file, imageUrl);
  const text = comment?.trim() || null;

  const hasLocation = latitude != null && longitude != null;
  if (!text && !image && !hasLocation) {
    throw ApiError.unprocessable(
      'Komentar tidak boleh kosong: isi teks atau lampirkan gambar',
      [
        {
          field: 'comment',
          message: 'Isi komentar, lampirkan gambar, atau tambahkan lokasi',
        },
      ]
    );
  }

  const createdComment = await prisma.comment.create({
    data: {
      postId,
      userId: user.id,
      parentId: parentId || null,
      comment: text,
      image,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      locationName: locationName?.trim() || null,
    },
    select: selectFor(user.id),
  });

  return toCommentDto(createdComment);
}

export async function toggleLike(userId, postId, commentId) {
  const comment = await prisma.comment.findFirst({
    where: { id: commentId, postId },
    select: { id: true },
  });

  if (!comment) {
    throw ApiError.notFound('Komentar tidak ditemukan');
  }

  const key = { userId_commentId: { userId, commentId } };
  const existing = await prisma.commentLike.findUnique({ where: key });

  if (existing) {
    await prisma.commentLike.delete({ where: key });
  } else {
    try {
      await prisma.commentLike.create({ data: { userId, commentId } });
    } catch (err) {
      if (err.code !== 'P2002') throw err;
    }
  }

  const [liked, likesCount] = await Promise.all([
    prisma.commentLike.findUnique({ where: key }).then(Boolean),
    prisma.commentLike.count({ where: { commentId } }),
  ]);

  return { liked, likesCount };
}


// edit dan delete
// ==================================
// MENGEDIT KOMENTAR
// ==================================
export async function update(user, postId, commentId, body, file) {
  const existingComment = await prisma.comment.findFirst({
    where: {
      id: commentId,
      postId,
    },
  });

  if (!existingComment) {
    throw ApiError.notFound('Komentar tidak ditemukan');
  }

  // Hanya pemilik komentar yang boleh mengedit.
  if (existingComment.userId !== user.id) {
    throw ApiError.forbidden(
      'Anda hanya dapat mengedit komentar milik sendiri'
    );
  }

  // Jika teks tidak dikirim, gunakan teks lama.
  const text = Object.hasOwn(body, 'comment')
    ? body.comment?.trim() || null
    : existingComment.comment;

  // Pertahankan gambar lama jika tidak ada perubahan.
  let image = existingComment.image;
  let latitude = existingComment.latitude;
  let longitude = existingComment.longitude;
  let locationName = existingComment.locationName;

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

  // Komentar tidak boleh kosong.
  if (!text && !image && !(latitude != null && longitude != null)) {
    throw ApiError.unprocessable(
      'Komentar tidak boleh kosong: isi teks atau lampirkan gambar'
    );
  }

  const updatedComment = await prisma.comment.update({
    where: {
      id: commentId,
    },
    data: {
      comment: text,
      image,
      latitude,
      longitude,
      locationName,
      updatedAt: new Date(),
    },
    select: selectFor(user.id),
  });

  // Hapus gambar lama jika diganti atau dihapus.
  if (existingComment.image && existingComment.image !== image) {
    await removeLocalFile(existingComment.image);
  }

  return toCommentDto(updatedComment);
}

// ==================================
// MENGHAPUS KOMENTAR
// ==================================
export async function remove(user, postId, commentId) {
  const existingComment = await prisma.comment.findFirst({
    where: {
      id: commentId,
      postId,
    },
  });

  if (!existingComment) {
    throw ApiError.notFound('Komentar tidak ditemukan');
  }

  // Hanya pemilik komentar yang boleh menghapus.
  if (existingComment.userId !== user.id) {
    throw ApiError.forbidden(
      'Anda hanya dapat menghapus komentar milik sendiri'
    );
  }

  const comments = await prisma.comment.findMany({
    where: { postId },
    select: { id: true, parentId: true, image: true },
  });
  const commentsById = new Map(comments.map((comment) => [comment.id, comment]));
  const childrenByParent = new Map();

  comments.forEach((comment) => {
    if (comment.parentId === null) return;
    const siblings = childrenByParent.get(comment.parentId) || [];
    siblings.push(comment.id);
    childrenByParent.set(comment.parentId, siblings);
  });

  const relatedComments = [];
  const pendingIds = [commentId];
  while (pendingIds.length > 0) {
    const currentId = pendingIds.pop();
    const current = commentsById.get(currentId);
    if (!current) continue;
    relatedComments.push(current);
    pendingIds.push(...(childrenByParent.get(currentId) || []));
  }

  await prisma.$transaction((transaction) => deleteCommentsBottomUp(transaction, relatedComments));

  // Hapus gambar komentar dan seluruh balasannya jika ada.
  await Promise.all(relatedComments.map((comment) => removeLocalFile(comment.image)));
}
