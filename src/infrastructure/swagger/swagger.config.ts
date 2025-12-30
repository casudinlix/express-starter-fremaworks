import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import config from '../../config';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: config.app.name,
      version: config.app.apiVersion,
      description: 'Enterprise-grade Node.js Backend Framework API Documentation',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.app.port}/api/${config.app.apiVersion}`,
        description: 'Development server',
      },
      {
        url: '/',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Success message',
            },
            data: {
              type: 'object',
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
            },
            data: {
              type: 'array',
              items: {},
            },
            meta: {
              type: 'object',
              properties: {
                page: {
                  type: 'number',
                  example: 1,
                },
                limit: {
                  type: 'number',
                  example: 10,
                },
                total: {
                  type: 'number',
                  example: 100,
                },
                totalPages: {
                  type: 'number',
                  example: 10,
                },
              },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
  },
  apis: ['./src/presentation/routes/*.ts', './src/presentation/controllers/*.ts'],
};

//presistent data
const swaggerSpec = swaggerJsdoc(swaggerOptions);

export const setupSwagger = (app: Express) => {
  if (config.swagger.enabled) {
    app.use(
      config.swagger.path,
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        swaggerOptions: {
          persistAuthorization: true, // biar ga ilang setiap refresh
        },
      })
    );
    app.get(`${config.swagger.path}.json`, (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
  }
};

export default swaggerSpec;
