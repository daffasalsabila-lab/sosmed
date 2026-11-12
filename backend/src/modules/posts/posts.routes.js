import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { uploadImage } from '../../middlewares/upload.js';
import { parseIdParam, validate } from '../../middlewares/validate.js';
import commentsRoutes from '../comments/comments.routes.js';
import likesRoutes from '../likes/likes.routes.js';
import * as controller from './posts.controller.js';
import { createPostSchema } from './posts.validation.js';

const router = Router();
router.use(authenticate);

router.get('/', controller.list);
router.post('/', uploadImage('image'), validate(createPostSchema), controller.create);
router.delete('/:postId', parseIdParam('postId'), controller.remove);

// Sub-resource
router.use('/:postId/like', likesRoutes);
router.use('/:postId/comments', commentsRoutes);

export default router;
