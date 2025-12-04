import swaggerJsdoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NIRDonia Village Council API',
      version: '1.0.0',
      description: 'API documentation for NIRDonia Village Council backend service',
      contact: {
        name: 'API Support',
      },
      license: {
        name: 'ISC',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://api.example.com',
        description: 'Production server',
      },
    ],
    components: {
      schemas: {
        CouncilPost: {
          type: 'object',
          required: ['content', 'hash'],
          properties: {
            _id: {
              type: 'string',
              description: 'Unique identifier for the post',
              example: '507f1f77bcf86cd799439011',
            },
            author: {
              type: 'string',
              description: 'Author of the post',
              example: 'username',
            },
            content: {
              type: 'string',
              description: 'Content of the post',
              maxLength: 500,
              example: 'Today I installed Linux on my school laptop',
            },
            votes: {
              type: 'number',
              description: 'Number of votes',
              minimum: 0,
              example: 5,
            },
            hash: {
              type: 'string',
              description: 'Unique hash identifier for the post',
              example: 'A1B2C3D4',
            },
            isAnonymous: {
              type: 'boolean',
              description: 'Whether the post is anonymous',
              example: false,
            },
            taskType: {
              type: 'string',
              enum: ['repair', 'replace', 'privacy', 'learn', 'general'],
              description: 'Type of task',
              example: 'repair',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        CreatePostRequest: {
          type: 'object',
          required: ['content'],
          properties: {
            content: {
              type: 'string',
              description: 'Content of the post (max 500 characters)',
              maxLength: 500,
              example: 'Today I installed Linux on my school laptop',
            },
            author: {
              type: 'string',
              description: 'Author name (optional, defaults to Guest_XXX if not provided)',
              example: 'username',
            },
            isAnonymous: {
              type: 'boolean',
              description: 'Whether to post anonymously',
              default: false,
              example: false,
            },
            taskType: {
              type: 'string',
              enum: ['repair', 'replace', 'privacy', 'learn', 'general'],
              description: 'Type of task',
              default: 'general',
              example: 'repair',
            },
          },
        },
        VoteRequest: {
          type: 'object',
          required: ['action'],
          properties: {
            action: {
              type: 'string',
              enum: ['increment', 'decrement'],
              description: 'Vote action',
              example: 'increment',
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
            },
          },
        },
        ErrorResponse: {
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
            error: {
              type: 'string',
              example: 'Detailed error message',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Council Posts',
        description: 'Operations related to council posts',
      },
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
    ],
  },
  apis: [join(rootDir, 'server/routes/*.js'), join(rootDir, 'server/server.js')], // Paths to files containing OpenAPI definitions
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;

