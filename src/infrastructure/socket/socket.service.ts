import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { JWTService } from '../auth/jwt.service';
import config from '../../config';
import logger from '../../shared/utils/pinoLogger';

export class SocketService {
  private static io: Server;

  static initialize(httpServer: HTTPServer): Server {
    this.io = new Server(httpServer, {
      cors: {
        origin: config.socket.corsOrigin,
        credentials: true,
      },
      path: config.socket.path,
    });

    // Authentication middleware for Socket.IO
    this.io.use((socket: Socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization;

        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const payload = JWTService.verifyAccessToken(token.replace('Bearer ', ''));
        (socket as any).user = payload;
        next();
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    });

    // Connection handler
    this.io.on('connection', (socket: Socket) => {
      const user = (socket as any).user;
      logger.info(`Socket connected: ${socket.id} - User: ${user?.email}`);

      // Join user-specific room
      if (user?.id) {
        socket.join(`user:${user.id}`);
      }

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(`Socket disconnected: ${socket.id}`);
      });

      // Example event handlers
      socket.on('message', (data) => {
        logger.info(`Message received from ${socket.id}:`, data);
        socket.emit('message', { message: 'Message received', data });
      });

      // Handle errors
      socket.on('error', (error) => {
        logger.error(`Socket error from ${socket.id}:`, error);
      });
    });

    logger.info('Socket.IO initialized');
    return this.io;
  }

  static getIO(): Server {
    if (!this.io) {
      throw new Error('Socket.IO not initialized. Call initialize() first.');
    }
    return this.io;
  }

  /**
   * Emit event to specific user
   */
  static emitToUser(userId: string, event: string, data: any): void {
    this.getIO().to(`user:${userId}`).emit(event, data);
  }

  /**
   * Emit event to all connected clients
   */
  static emitToAll(event: string, data: any): void {
    this.getIO().emit(event, data);
  }

  /**
   * Emit event to specific room
   */
  static emitToRoom(room: string, event: string, data: any): void {
    this.getIO().to(room).emit(event, data);
  }
}
