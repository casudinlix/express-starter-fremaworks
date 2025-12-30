import dotenv from 'dotenv';

dotenv.config();

interface Config {
  app: {
    name: string;
    env: string;
    port: number;
    apiVersion: string;
    apiKey: string;
    timezone: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  database: {
    type: 'postgres' | 'mysql' | 'mongodb';
    postgres: {
      host: string;
      port: number;
      username: string;
      password: string;
      database: string;
    };
    mysql: {
      host: string;
      port: number;
      username: string;
      password: string;
      database: string;
    };
    mongodb: {
      uri: string;
    };
  };
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };
  queue: {
    redis: {
      host: string;
      port: number;
      password?: string;
    };
  };
  socket: {
    corsOrigin: string;
    path: string;
  };
  security: {
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
    bcryptRounds: number;
    corsOrigin: string;
  };
  logging: {
    level: string;
    filePath: string;
  };
  swagger: {
    enabled: boolean;
    path: string;
  };
  performance: {
    enableCompression: boolean;
    enableCache: boolean;
    cacheTTL: number;
  };
  externalApi: {
    baseUrl: string;
    apiKey: string;
    timeout: number;
  };
}

const config: Config = {
  app: {
    name: process.env.APP_NAME || 'Node-Framework-Backend',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    apiVersion: process.env.API_VERSION || 'v1',
    apiKey: process.env.API_KEY || 'your-api-key',
    timezone: process.env.TZ || 'UTC',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as string,
    refreshExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as string,
  },
  database: {
    type: (process.env.DB_TYPE as 'postgres' | 'mysql' | 'mongodb') || 'postgres',
    postgres: {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DATABASE || 'node_framework',
    },
    mysql: {
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306', 10),
      username: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'root',
      database: process.env.MYSQL_DATABASE || 'node_framework',
    },
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/node_framework',
    },
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },
  queue: {
    redis: {
      host: process.env.QUEUE_REDIS_HOST || 'localhost',
      port: parseInt(process.env.QUEUE_REDIS_PORT || '6379', 10),
      password: process.env.QUEUE_REDIS_PASSWORD || undefined,
    },
  },
  socket: {
    corsOrigin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3001',
    path: process.env.SOCKET_PATH || '/socket.io',
  },
  security: {
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || './logs',
  },
  swagger: {
    enabled: process.env.SWAGGER_ENABLED === 'true',
    path: process.env.SWAGGER_PATH || '/api-docs',
  },
  performance: {
    enableCompression: process.env.ENABLE_COMPRESSION === 'true',
    enableCache: process.env.ENABLE_CACHE === 'true',
    cacheTTL: parseInt(process.env.CACHE_TTL || '3600', 10),
  },
  externalApi: {
    baseUrl: process.env.EXTERNAL_API_BASE_URL || 'https://api.example.com',
    apiKey: process.env.EXTERNAL_API_KEY || '',
    timeout: parseInt(process.env.EXTERNAL_API_TIMEOUT || '30000', 10),
  },
};

export default config;
