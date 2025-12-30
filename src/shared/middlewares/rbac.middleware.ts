import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors/AppError';
import { AuthService } from '../../application/services/auth.service';
import { AuthRequest } from './auth.middleware';

// Create AuthService instance
const authService = new AuthService();

/**
 * RBAC Middleware - Check if user has required permission
 */
export const requirePermission = (...permissions: string[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const user = (req as AuthRequest).user;

      if (!user) {
        throw new ForbiddenError('Authentication required');
      }

      // Check if user has any of the required permissions
      for (const permission of permissions) {
        const hasPermission = await authService.hasPermission(user.id, permission);
        if (hasPermission) {
          return next();
        }
      }

      throw new ForbiddenError('Insufficient permissions');
    } catch (error) {
      next(error);
    }
  };
};

/**
 * RBAC Middleware - Check if user has required role
 */
export const requireRole = (...roles: string[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const user = (req as AuthRequest).user;

      if (!user) {
        throw new ForbiddenError('Authentication required');
      }

      // Check if user has any of the required roles
      for (const role of roles) {
        const hasRole = await authService.hasRole(user.id, role);
        if (hasRole) {
          return next();
        }
      }

      throw new ForbiddenError('Insufficient permissions');
    } catch (error) {
      next(error);
    }
  };
};
