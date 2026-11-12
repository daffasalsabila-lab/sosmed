import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import postRoutes from '../modules/posts/posts.routes.js';
import userRoutes from '../modules/users/users.routes.js';

const router = Router();

router.get('/health', (req, res) => res.json({ success: true, message: 'OK' }));
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);

export default router;
