import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/response.js';
import * as service from './likes.service.js';

export const toggle = asyncHandler(async (req, res) => {
  const result = await service.toggle(req.user.id, req.params.postId);
  sendSuccess(res, result, result.liked ? 'Postingan disukai' : 'Like dibatalkan');
});
