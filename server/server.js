import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import councilRoutes from './routes/council.js';

// Load environment variables
// Load from project root (where .env file is located)
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Try .env.local first (for Vite compatibility), then .env
dotenv.config({ path: join(rootDir, '.env.local') });
dotenv.config({ path: join(rootDir, '.env') }); // This will override with .env if it exists

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env file');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('✅ Connected to MongoDB Atlas');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'NIRDonia API Documentation'
}));

// Routes
app.use('/api/council', councilRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the server
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: Server is running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  res.json({
    success: true,
    message: 'NIRDonia Village Council API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    server: {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version
    },
    database: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      name: mongoose.connection.name || 'nirdonia'
    },
    endpoints: {
      root: {
        method: 'GET',
        path: '/',
        description: 'API information and endpoints list'
      },
      health: {
        method: 'GET',
        path: '/health',
        url: `${baseUrl}/health`,
        description: 'Server health check'
      },
      getPosts: {
        method: 'GET',
        path: '/api/council/posts',
        url: `${baseUrl}/api/council/posts`,
        description: 'Get all council posts (sorted by newest)'
      },
      createPost: {
        method: 'POST',
        path: '/api/council/posts',
        url: `${baseUrl}/api/council/posts`,
        description: 'Create a new council post',
        body: {
          content: 'string (required, max 500 chars)',
          author: 'string (optional)',
          isAnonymous: 'boolean (optional)',
          taskType: 'string (optional: repair, replace, privacy, learn, general)'
        }
      },
      votePost: {
        method: 'PUT',
        path: '/api/council/posts/:id/vote',
        url: `${baseUrl}/api/council/posts/:id/vote`,
        description: 'Vote on a post (increment or decrement)',
        body: {
          action: 'string (required: "increment" or "decrement")'
        }
      },
      deletePost: {
        method: 'DELETE',
        path: '/api/council/posts/:id',
        url: `${baseUrl}/api/council/posts/:id`,
        description: 'Delete a council post (for moderation)'
      }
    },
    documentation: {
      swagger: `${baseUrl}/api-docs`,
      readme: `${baseUrl}/api/council`
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}/api/council`);
  console.log(`📚 Swagger documentation at http://localhost:${PORT}/api-docs`);
});

export default app;

