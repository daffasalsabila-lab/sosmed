
import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { uploadImage } from '../../middlewares/upload.js';
import { parseIdParam, validate } from '../../middlewares/validate.js';

import commentsRoutes from '../comments/comments.routes.js';
import likesRoutes from '../likes/likes.routes.js';

import * as controller from './posts.controller.js';
import {
  createPostSchema,
  updatePostSchema,
} from './posts.validation.js';

const router = Router();

router.use(authenticate);

// Menampilkan semua postingan
router.get('/', controller.list);

// Membuat postingan
router.post(
  '/',
  uploadImage('image'),
  validate(createPostSchema),
  controller.create
);

// edit dan delete
// Mengedit postingan
router.patch(
  '/:postId',
  parseIdParam('postId'),
  uploadImage('image'),
  validate(updatePostSchema),
  controller.update
);

// Menghapus postingan
router.delete(
  '/:postId',
  parseIdParam('postId'),
  controller.remove
);

// Sub-resource: likes dan comments
router.use('/:postId/like', likesRoutes);
router.use('/:postId/comments', commentsRoutes);

export default router;
