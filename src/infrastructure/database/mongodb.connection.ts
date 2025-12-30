import mongoose from 'mongoose';
import config from '../../config';
import logger from '../../shared/utils/pinoLogger';

export class MongoDBConnection {
  private static instance: typeof mongoose;

  static async connect(): Promise<typeof mongoose> {
    if (this.instance && this.instance.connection.readyState === 1) {
      return this.instance;
    }

    try {
      this.instance = await mongoose.connect(config.database.mongodb.uri, {
        maxPoolSize: 10,
        minPoolSize: 5,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      logger.info('MongoDB connected successfully');

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        logger.error('MongoDB connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
      });

      return this.instance;
    } catch (error) {
      logger.error('MongoDB connection error:', error);
      throw error;
    }
  }

  static async disconnect(): Promise<void> {
    if (this.instance) {
      await mongoose.disconnect();
      logger.info('MongoDB disconnected');
    }
  }

  static getConnection(): typeof mongoose {
    if (!this.instance || this.instance.connection.readyState !== 1) {
      throw new Error('Database not initialized. Call connect() first.');
    }
    return this.instance;
  }
}
