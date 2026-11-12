import { Router } from 'express';
import { uploadImage } from '../../middlewares/upload.js';
import { parseIdParam, validate } from '../../middlewares/validate.js';
import * as controller from './comments.controller.js';
import { createCommentSchema } from './comments.validation.js';

const router = Router({ mergeParams: true });

router.get('/', parseIdParam('postId'), controller.list);
router.post(
  '/',
  parseIdParam('postId'),
  uploadImage('image'),
  validate(createCommentSchema),
  controller.create,
);

export default router;
