import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/AppError';
import config from '../../config';

/**
 * Middleware to verify X-API-Key header
 */
export const verifyApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new UnauthorizedError('API key is required');
    }

    // Find API
    const keyRecord = apiKey === config.app.apiKey;

    if (!keyRecord) {
      throw new UnauthorizedError('Invalid or expired API key');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to verify either Bearer token OR API key
 */
export const verifyBearerOrApiKey = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers['x-api-key'];

  // If Bearer token is provided, use JWT authentication
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const { authenticate } = await import('./auth.middleware');
    return authenticate(req, res, next);
  }

  // If API key is provided, use API key authentication
  if (apiKey) {
    return verifyApiKey(req, res, next);
  }

  // Neither provided
  return next(new UnauthorizedError('Authentication required (Bearer token or API key)'));
};
