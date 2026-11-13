import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { uploadImage } from '../../middlewares/upload.js';
import { parseIdParam, validate } from '../../middlewares/validate.js';
import * as controller from './users.controller.js';
import { changePasswordSchema, updateProfileSchema } from './users.validation.js';

const router = Router();
router.use(authenticate);

router.get('/:userId', parseIdParam('userId'), controller.getPublicProfile);
router.put('/profile', uploadImage('avatar'), validate(updateProfileSchema), controller.updateProfile);
router.put('/password', validate(changePasswordSchema), controller.changePassword);

export default router;
