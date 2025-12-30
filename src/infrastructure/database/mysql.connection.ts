import mysql from 'mysql2/promise';
import config from '../../config';
import logger from '../../shared/utils/pinoLogger';

export class MySQLConnection {
  private static pool: mysql.Pool;

  static async connect(): Promise<mysql.Pool> {
    if (this.pool) {
      return this.pool;
    }

    try {
      this.pool = mysql.createPool({
        host: config.database.mysql.host,
        port: config.database.mysql.port,
        user: config.database.mysql.username,
        password: config.database.mysql.password,
        database: config.database.mysql.database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
      });

      // Test connection
      const connection = await this.pool.getConnection();
      connection.release();

      logger.info('MySQL connected successfully');
      return this.pool;
    } catch (error) {
      logger.error('MySQL connection error:', error);
      throw error;
    }
  }

  static async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      logger.info('MySQL disconnected');
    }
  }

  static getPool(): mysql.Pool {
    if (!this.pool) {
      throw new Error('Database not initialized. Call connect() first.');
    }
    return this.pool;
  }

  static async query(sql: string, params?: any[]): Promise<any> {
    const pool = this.getPool();
    const [rows] = await pool.execute(sql, params);
    return rows;
  }
}
