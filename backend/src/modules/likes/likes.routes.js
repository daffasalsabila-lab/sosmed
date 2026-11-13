import { Router } from 'express';
import { parseIdParam } from '../../middlewares/validate.js';
import * as controller from './likes.controller.js';

const router = Router({ mergeParams: true });

router.post('/', parseIdParam('postId'), controller.toggle);

export default router;
