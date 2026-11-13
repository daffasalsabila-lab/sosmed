
import { Router } from 'express';
import { uploadImage } from '../../middlewares/upload.js';
import { parseIdParam, validate } from '../../middlewares/validate.js';

import * as controller from './comments.controller.js';

import {
  createCommentSchema,
  updateCommentSchema,
} from './comments.validation.js';

const router = Router({ mergeParams: true });

// Menampilkan komentar
router.get(
  '/',
  parseIdParam('postId'),
  controller.list
);

// Membuat komentar
router.post(
  '/',
  parseIdParam('postId'),
  uploadImage('image'),
  validate(createCommentSchema),
  controller.create
);

router.post(
  '/:commentId/like',
  parseIdParam('postId'),
  parseIdParam('commentId'),
  controller.toggleLike
);

// Kedua metode didukung untuk klien yang menggunakan PATCH maupun PUT.
const updateCommentMiddleware = [
  parseIdParam('postId'),
  parseIdParam('commentId'),
  uploadImage('image'),
  validate(updateCommentSchema),
  controller.update
];

router.patch('/:commentId', ...updateCommentMiddleware);
router.put('/:commentId', ...updateCommentMiddleware);

// Menghapus komentar
router.delete(
  '/:commentId',
  parseIdParam('postId'),
  parseIdParam('commentId'),
  controller.remove
);

export default router;
