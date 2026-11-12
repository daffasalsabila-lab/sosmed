import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import * as controller from './auth.controller.js';
import { loginSchema, registerSchema } from './auth.validation.js';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Terlalu banyak percobaan, coba lagi beberapa menit lagi' },
});

const router = Router();

router.post('/register', limiter, validate(registerSchema), controller.register);
router.post('/login', limiter, validate(loginSchema), controller.login);
router.get('/me', authenticate, controller.me);
router.post('/logout', authenticate, controller.logout);

export default router;
