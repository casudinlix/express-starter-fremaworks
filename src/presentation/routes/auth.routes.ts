import { Router, type Router as RouterType } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '@shared/middlewares/validation.middleware';
import { body } from 'express-validator';
import { authenticate } from '@shared/middlewares/auth.middleware';
import { strictRateLimiter } from '@shared/middlewares/security.middleware';
import { asyncHandler } from '@shared/utils/asyncHandler';

const router: RouterType = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 */
router.post(
  '/register',
  strictRateLimiter,
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('name').isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('phone')
      .optional()
      .isLength({ min: 10, max: 20 })
      .withMessage('Phone must be 10-20 characters'),
  ],
  validate,
  asyncHandler(AuthController.register)
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 */
router.post(
  '/login',
  strictRateLimiter,
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  asyncHandler(AuthController.login)
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 */
router.get('/me', authenticate, asyncHandler(AuthController.me));

/**
 * @swagger
 * /auth/api-key:
 *   post:
 *     summary: Generate API key
 *     tags: [Auth]
 */
router.post(
  '/api-key',
  authenticate,
  [
    body('name').isLength({ min: 3, max: 100 }).withMessage('Name must be 3-100 characters'),
    body('expiresInDays')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('Expires must be 1-365 days'),
  ],
  validate,
  asyncHandler(AuthController.generateApiKey)
);

export default router;
