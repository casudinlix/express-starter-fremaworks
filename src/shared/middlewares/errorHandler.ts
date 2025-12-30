import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import logger from '../utils/pinoLogger';
import config from '../../config';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }

  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userId: (req as any).user?.id,
  });

  // Send error response
  const response: any = {
    success: false,
    message,
    ...(config.app.env === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};
