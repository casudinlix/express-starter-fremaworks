// Set default timezone to UTC
process.env.TZ = 'UTC';

import 'reflect-metadata';
import express, { Express } from 'express';
import { createServer, Server } from 'http';
import compression from 'compression';
import config from './config';
import logger, { pinoHttpMiddleware } from './shared/utils/pinoLogger';
import KnexDatabase from './infrastructure/database/knex/knex';
import { RedisClient } from './infrastructure/cache/redis.client';
import { SocketService } from './infrastructure/socket/socket.service';
import { applySecurity } from './shared/middlewares/security.middleware';
import { xssProtection } from './shared/middlewares/xss.middleware';
import { errorHandler, notFoundHandler } from './shared/middlewares/errorHandler';
import { setupSwagger } from './infrastructure/swagger/swagger.config';
import routes from './presentation/routes';

class Application {
  private app: Express;
  private httpServer: Server;

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
  }

  private async initializeDatabase(): Promise<void> {
    try {
      const connected = await KnexDatabase.testConnection();
      if (connected) {
        logger.info('Database initialized successfully');
      } else {
        throw new Error('Database connection test failed');
      }
    } catch (error) {
      logger.error('Database initialization failed', error);
      throw error;
    }
  }

  private async initializeCache(): Promise<void> {
    try {
      if (config.performance.enableCache) {
        await RedisClient.connect();
        logger.info('Redis cache initialized successfully');
      }
    } catch (error) {
      logger.error('Redis initialization failed:', error);
      // Don't throw error, cache is optional
    }
  }

  private initializeMiddlewares(): void {
    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compression
    if (config.performance.enableCompression) {
      this.app.use(compression());
    }

    // Logging with Pino
    this.app.use(pinoHttpMiddleware);

    // Security
    applySecurity(this.app);
    // XSS Protection
    this.app.use(xssProtection);

    logger.info('Middlewares initialized');
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use(`/api/${config.app.apiVersion}`, routes);

    // Swagger documentation
    setupSwagger(this.app);

    // 404 handler
    this.app.use(notFoundHandler);

    // Error handler (must be last)
    this.app.use(errorHandler);

    logger.info('Routes initialized');
  }

  private initializeSocket(): void {
    SocketService.initialize(this.httpServer);
    logger.info('Socket.IO initialized');
  }

  private async gracefulShutdown(): Promise<void> {
    logger.info('Shutting down gracefully...');

    try {
      // Close HTTP server
      await new Promise<void>((resolve) => {
        this.httpServer.close(() => {
          logger.info('HTTP server closed');
          resolve();
        });
      });

      // Close database connections
      await KnexDatabase.destroy();

      // Close Redis connection
      await RedisClient.disconnect();

      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    process.on('SIGTERM', () => this.gracefulShutdown());
    process.on('SIGINT', () => this.gracefulShutdown());

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      this.gracefulShutdown();
    });
  }

  public async start(): Promise<void> {
    try {
      // Initialize database
      logger.info('Starting database initialization...');
      await this.initializeDatabase();

      // Initialize cache
      logger.info('Starting cache initialization...');
      await this.initializeCache();

      // Initialize middlewares
      logger.info('Starting middleware initialization...');
      this.initializeMiddlewares();

      // Initialize routes
      logger.info('Starting route initialization...');
      this.initializeRoutes();

      // Initialize Socket.IO
      logger.info('Starting Socket.IO initialization...');
      this.initializeSocket();

      // Setup graceful shutdown
      logger.info('Setting up graceful shutdown handlers...');
      this.setupGracefulShutdown();

      // Start server
      logger.info('Starting HTTP server...');
      this.httpServer.listen(config.app.port, () => {
        logger.info(`
          ╔═══════════════════════════════════════════════════════╗
          ║                                                       ║
          ║   🚀 ${config.app.name}                              ║
          ║                                                       ║
          ║   Environment: ${config.app.env.toUpperCase().padEnd(38)} ║
          ║   Port: ${config.app.port.toString().padEnd(44)} ║
          ║   API Version: ${config.app.apiVersion.padEnd(38)} ║
          ║                                                       ║
          ║   API: http://localhost:${config.app.port}/api/${config.app.apiVersion.padEnd(18)} ║
          ║   Swagger: http://localhost:${config.app.port}${config.swagger.path.padEnd(22)} ║
          ║                                                       ║
          ╚═══════════════════════════════════════════════════════╝
        `);
      });
    } catch (error) {
      logger.error('Failed to start application:', error);
      console.error('DETAILED ERROR:', error);
      process.exit(1);
    }
  }
}

// Start application
const app = new Application();
app.start();

export default app;
