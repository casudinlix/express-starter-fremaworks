import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../../infrastructure/auth/jwt.service';
import { UnauthorizedError } from '../errors/AppError';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);
    const payload = JWTService.verifyAccessToken(token);

    (req as AuthRequest).user = payload;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user;

    if (!user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (roles.length && !roles.includes(user.role || '')) {
      return next(new UnauthorizedError('Insufficient permissions'));
    }

    next();
  };
};
