import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/response.js';
import * as service from './comments.service.js';

export const list = asyncHandler(async (req, res) => {
  sendSuccess(res, await service.list(req.params.postId, req.user.id));
});

export const create = asyncHandler(async (req, res) => {
  const comment = await service.create(req.user, req.params.postId, req.body, req.file);
  sendSuccess(res, comment, 'Komentar terkirim', 201);
});

// edit dan delete

export const update = asyncHandler(async (req, res) => {
  const comment = await service.update(
    req.user,
    req.params.postId,
    req.params.commentId,
    req.body,
    req.file
  );

  sendSuccess(res, comment, 'Komentar berhasil diperbarui');
});

export const remove = asyncHandler(async (req, res) => {
  await service.remove(
    req.user,
    req.params.postId,
    req.params.commentId
  );

  sendSuccess(res, null, 'Komentar berhasil dihapus');
});

export const toggleLike = asyncHandler(async (req, res) => {
  const result = await service.toggleLike(
    req.user.id,
    req.params.postId,
    req.params.commentId
  );
  sendSuccess(res, result, 'Like komentar diperbarui');
});