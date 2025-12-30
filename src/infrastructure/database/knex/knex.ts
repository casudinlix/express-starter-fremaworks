import knex, { Knex } from 'knex';
import knexConfig from '../../../knexfile';
import config from '../../../config';
import logger from '../../../shared/utils/pinoLogger';

class KnexDatabase {
  private static instance: Knex;

  static getInstance(): Knex {
    if (!this.instance) {
      const environment = config.app.env || 'development';
      this.instance = knex(knexConfig[environment]);

      logger.info(`Knex initialized for ${environment} environment`);
    }
    return this.instance;
  }

  static async testConnection(): Promise<boolean> {
    try {
      await this.getInstance().raw('SELECT 1');
      logger.info('Database connection successful');
      return true;
    } catch (error) {
      logger.error('Database connection failed', error);
      return false;
    }
  }

  static async destroy(): Promise<void> {
    if (this.instance) {
      await this.instance.destroy();
      logger.info('Database connection closed');
    }
  }
}

// Export singleton instance
export const db = KnexDatabase.getInstance();
export default KnexDatabase;
