import { Request, Response } from 'express';
import { AuthService } from '../../application/services/auth.service';
import { ResponseFormatter } from '../../shared/utils/responseFormatter';
import { AuthRequest } from '../../shared/middlewares/auth.middleware';

// Create AuthService instance
const authService = new AuthService();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and authorization endpoints
 */

export class AuthController {
  /**
   * @swagger
   * /auth/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *               - name
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: user@example.com
   *               password:
   *                 type: string
   *                 format: password
   *                 example: Password123!
   *               name:
   *                 type: string
   *                 example: John Doe
   *               phone:
   *                 type: string
   *                 example: +6281234567890
   *     responses:
   *       201:
   *         description: User registered successfully
   *       400:
   *         description: Validation error
   *       409:
   *         description: Email already registered
   */
  static async register(req: Request, res: Response): Promise<void> {
    const { email, password, name, phone } = req.body;

    const result = await authService.register({ email, password, name, phone });

    ResponseFormatter.created(res, result, 'User registered successfully');
  }

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Login user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: user@example.com
   *               password:
   *                 type: string
   *                 format: password
   *                 example: Password123!
   *     responses:
   *       200:
   *         description: Login successful
   *       401:
   *         description: Invalid credentials
   */
  static async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    ResponseFormatter.success(res, result, 'Login successful');
  }

  /**
   * @swagger
   * /auth/me:
   *   get:
   *     summary: Get current user profile with roles and permissions
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User profile retrieved successfully
   *       401:
   *         description: Unauthorized
   */
  static async me(req: Request, res: Response): Promise<void> {
    const user = (req as AuthRequest).user;

    const profile = await authService.getProfile(user!.id);

    ResponseFormatter.success(res, profile, 'Profile retrieved successfully');
  }

  /**
   * @swagger
   * /auth/api-key:
   *   post:
   *     summary: Generate API key for current user
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *             properties:
   *               name:
   *                 type: string
   *                 example: My API Key
   *               expiresInDays:
   *                 type: number
   *                 example: 90
   *     responses:
   *       201:
   *         description: API key generated successfully
   *       401:
   *         description: Unauthorized
   */
  static async generateApiKey(req: Request, res: Response): Promise<void> {
    const user = (req as AuthRequest).user;
    const { name, expiresInDays } = req.body;

    const apiKey = await authService.generateApiKey(user!.id, name, expiresInDays);

    ResponseFormatter.created(
      res,
      apiKey,
      'API key generated successfully. Please save it securely, it will not be shown again.'
    );
  }
}
