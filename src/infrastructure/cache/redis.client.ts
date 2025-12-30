import { createClient, RedisClientType } from 'redis';
import config from '../../config';
import logger from '../../shared/utils/pinoLogger';

export class RedisClient {
  private static client: RedisClientType;

  static async connect(): Promise<RedisClientType> {
    if (this.client && this.client.isOpen) {
      return this.client;
    }

    try {
      this.client = createClient({
        socket: {
          host: config.redis.host,
          port: config.redis.port,
        },
        password: config.redis.password,
        database: config.redis.db,
      });

      this.client.on('error', (error) => {
        logger.error('Redis client error:', error);
      });

      this.client.on('connect', () => {
        logger.info('Redis connected successfully');
      });

      await this.client.connect();
      return this.client;
    } catch (error) {
      logger.error('Redis connection error:', error);
      throw error;
    }
  }

  static async disconnect(): Promise<void> {
    if (this.client && this.client.isOpen) {
      await this.client.quit();
      logger.info('Redis disconnected');
    }
  }

  static getClient(): RedisClientType {
    if (!this.client || !this.client.isOpen) {
      throw new Error('Redis not initialized. Call connect() first.');
    }
    return this.client;
  }

  // Cache helpers
  static async get(key: string): Promise<string | null> {
    const client = this.getClient();
    return await client.get(key);
  }

  static async set(key: string, value: string, ttl?: number): Promise<void> {
    const client = this.getClient();
    if (ttl) {
      await client.setEx(key, ttl, value);
    } else {
      await client.set(key, value);
    }
  }

  static async del(key: string): Promise<void> {
    const client = this.getClient();
    await client.del(key);
  }

  static async exists(key: string): Promise<boolean> {
    const client = this.getClient();
    const result = await client.exists(key);
    return result === 1;
  }

  static async setJSON(key: string, value: any, ttl?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttl);
  }

  static async getJSON<T>(key: string): Promise<T | null> {
    const data = await this.get(key);
    return data ? JSON.parse(data) : null;
  }
}
