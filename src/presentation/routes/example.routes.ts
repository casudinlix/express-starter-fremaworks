import { Router, Request, Response, type Router as RouterType } from 'express';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { verifyApiKey, verifyBearerOrApiKey } from '../../shared/middlewares/apiKey.middleware';
import { requireRole, requirePermission } from '../../shared/middlewares/rbac.middleware';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ResponseFormatter } from '../../shared/utils/responseFormatter';
import { AuthRequest } from '../../shared/middlewares/auth.middleware';

const router: RouterType = Router();

/**
 * @swagger
 * /examples/protected:
 *   get:
 *     summary: Protected route (requires authentication)
 *     tags: [Examples]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/protected',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    ResponseFormatter.success(res, { message: 'You are authenticated!' });
  })
);

/**
 * @swagger
 * /examples/api-key:
 *   get:
 *     summary: API key protected route
 *     tags: [Examples]
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 */
router.get(
  '/api-key',
  verifyApiKey,
  asyncHandler(async (req: Request, res: Response) => {
    ResponseFormatter.success(res, { message: 'API key is valid!' });
  })
);

/**
 * @swagger
 * /examples/admin-only:
 *   get:
 *     summary: Admin only route (requires admin or super-admin role)
 *     tags: [Examples]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/admin-only',
  authenticate,
  requireRole('admin', 'super-admin'),
  asyncHandler(async (req: Request, res: Response) => {
    ResponseFormatter.success(res, { message: 'Welcome, admin!' });
  })
);

/**
 * @swagger
 * /examples/permission-check:
 *   get:
 *     summary: Permission-based route (requires users.view permission)
 *     tags: [Examples]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/permission-check',
  authenticate,
  requirePermission('users.view'),
  asyncHandler(async (req: Request, res: Response) => {
    ResponseFormatter.success(res, { message: 'You have users.view permission!' });
  })
);

export default router;
