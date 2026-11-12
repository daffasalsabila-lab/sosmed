import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/response.js';
import * as service from './posts.service.js';

export const list = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const { posts, hasMore } = await service.list(req.user.id, { page, limit });
  sendSuccess(res, posts, 'Berhasil', 200, { page, limit, hasMore });
});

export const create = asyncHandler(async (req, res) => {
  const post = await service.create(req.user, req.body, req.file);
  sendSuccess(res, post, 'Status berhasil diposting', 201);
});

export const remove = asyncHandler(async (req, res) => {
  await service.remove(req.user, req.params.postId);
  sendSuccess(res, null, 'Postingan berhasil dihapus');
});
