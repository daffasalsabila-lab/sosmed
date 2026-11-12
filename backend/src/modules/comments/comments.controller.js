import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/response.js';
import * as service from './comments.service.js';

export const list = asyncHandler(async (req, res) => {
  sendSuccess(res, await service.list(req.params.postId));
});

export const create = asyncHandler(async (req, res) => {
  const comment = await service.create(req.user, req.params.postId, req.body, req.file);
  sendSuccess(res, comment, 'Komentar terkirim', 201);
});
