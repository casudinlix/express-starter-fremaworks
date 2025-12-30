import { Router, type Router as RouterType } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import exampleRoutes from './example.routes';
import { verifyApiKey } from '@/shared/middlewares/apiKey.middleware';

const router: RouterType = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/auth', verifyApiKey, authRoutes);
router.use('/users', verifyApiKey, userRoutes);
router.use('/examples', exampleRoutes);

export default router;
