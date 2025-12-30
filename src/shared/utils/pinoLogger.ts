import pino from 'pino';
import path from 'path';
import config from '../../config';

// Create Pino logger with file rotation using pino-roll
const logger = pino(
  {
    level: config.logging.level,
    formatters: {
      level: (label) => {
        return { level: label.toUpperCase() };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    serializers: {
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
      err: pino.stdSerializers.err,
    },
  },
  config.app.env === 'development'
    ? pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      })
    : pino.transport({
        target: 'pino-roll',
        options: {
          file: path.join(config.logging.filePath, 'app.log'),
          frequency: 'daily',
          size: '10m',
          mkdir: true,
        },
      })
);

// Helper methods
export const logInfo = (message: string, data?: any) => {
  logger.info(data || {}, message);
};

export const logError = (message: string, error?: any) => {
  logger.error({ err: error }, message);
};

export const logWarn = (message: string, data?: any) => {
  logger.warn(data || {}, message);
};

export const logDebug = (message: string, data?: any) => {
  logger.debug(data || {}, message);
};

// Express middleware for request logging
export const pinoHttpMiddleware = (req: any, res: any, next: any) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(
      {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      },
      'HTTP Request'
    );
  });

  next();
};

export default logger;
