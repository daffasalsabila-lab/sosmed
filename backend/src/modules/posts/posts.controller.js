import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendSuccess } from '../../utils/response.js';
import * as service from './posts.service.js';

export const list = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const rawUserId = req.query.userId;
  const userId = rawUserId === undefined ? undefined : Number(rawUserId);

  if (rawUserId !== undefined && (typeof rawUserId !== 'string' || !Number.isInteger(userId) || userId < 1)) {
    throw ApiError.badRequest('Parameter userId tidak valid');
  }

  const { posts, hasMore } = await service.list(req.user.id, { page, limit, userId });
  sendSuccess(res, posts, 'Berhasil', 200, { page, limit, hasMore });
});

export const create = asyncHandler(async (req, res) => {
  const post = await service.create(req.user, req.body, req.file);
  sendSuccess(res, post, 'Status berhasil diposting', 201);
});

// edit dan delete
export const update = asyncHandler(async (req, res) => {
  const post = await service.update(
    req.user,
    req.params.postId,
    req.body,
    req.file
  );

  sendSuccess(res, post, 'Postingan berhasil diperbarui');
});

export const remove = asyncHandler(async (req, res) => {
  await service.remove(req.user, req.params.postId);
  sendSuccess(res, null, 'Postingan berhasil dihapus');
});

