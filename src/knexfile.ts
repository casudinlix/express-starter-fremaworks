import type { Knex } from 'knex';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: process.env.DB_TYPE === 'mysql' ? 'mysql2' : 'pg',
    connection:
      process.env.DB_TYPE === 'mysql'
        ? {
            host: process.env.MYSQL_HOST || 'localhost',
            port: parseInt(process.env.MYSQL_PORT || '3306'),
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || 'root',
            database: process.env.MYSQL_DATABASE || 'node_framework',
            timezone: process.env.TZ || 'UTC',
          }
        : {
            host: process.env.POSTGRES_HOST || 'localhost',
            port: parseInt(process.env.POSTGRES_PORT || '5432'),
            user: process.env.POSTGRES_USER || 'postgres',
            password: process.env.POSTGRES_PASSWORD || 'postgres',
            database: process.env.POSTGRES_DATABASE || 'node_framework',
            timezone: process.env.TZ || 'UTC',
          },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: path.join(__dirname, 'infrastructure/database/knex/migrations'),
      extension: 'ts',
    },
    seeds: {
      directory: path.join(__dirname, 'infrastructure/database/knex/seeds'),
      extension: 'ts',
    },
  },

  staging: {
    client: process.env.DB_TYPE === 'mysql' ? 'mysql2' : 'pg',
    connection:
      process.env.DB_TYPE === 'mysql'
        ? {
            host: process.env.MYSQL_HOST,
            port: parseInt(process.env.MYSQL_PORT || '3306'),
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            timezone: process.env.TZ || 'UTC',
          }
        : {
            host: process.env.POSTGRES_HOST,
            port: parseInt(process.env.POSTGRES_PORT || '5432'),
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DATABASE,
            timezone: process.env.TZ || 'UTC',
          },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: path.join(__dirname, 'infrastructure/database/knex/migrations'),
      extension: 'ts',
    },
    seeds: {
      directory: path.join(__dirname, 'infrastructure/database/knex/seeds'),
      extension: 'ts',
    },
  },

  production: {
    client: process.env.DB_TYPE === 'mysql' ? 'mysql2' : 'pg',
    connection:
      process.env.DB_TYPE === 'mysql'
        ? {
            host: process.env.MYSQL_HOST,
            port: parseInt(process.env.MYSQL_PORT || '3306'),
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            timezone: process.env.TZ || 'UTC',
          }
        : {
            host: process.env.POSTGRES_HOST,
            port: parseInt(process.env.POSTGRES_PORT || '5432'),
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DATABASE,
            timezone: process.env.TZ || 'UTC',
          },
    pool: {
      min: 2,
      max: 20,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: path.join(__dirname, 'infrastructure/database/knex/migrations'),
      extension: 'ts',
    },
    seeds: {
      directory: path.join(__dirname, 'infrastructure/database/knex/seeds'),
      extension: 'ts',
    },
  },
};

export default config;
