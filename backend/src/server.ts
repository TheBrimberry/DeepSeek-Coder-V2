import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { env } from './config/env';
import { testConnection } from './config/database';
import { logger } from './utils/logger';
import { apiLimiter } from './middleware/rateLimit';
import { requireAgeVerification } from './middleware/ageVerification';
import { CronService } from './services/CronService';
import { WebSocketService } from './services/WebSocketService';

// Route imports
import authRoutes from './routes/auth';
import videoRoutes from './routes/videos';
import categoryRoutes from './routes/categories';
import tagRoutes from './routes/tags';
import classifiedRoutes from './routes/classifieds';
import profileRoutes from './routes/profiles';
import chatRoutes from './routes/chat';
import userRoutes from './routes/user';
import adminRoutes from './routes/admin';

const app = express();
const server = createServer(app);

// Global middleware
app.use(helmet());
app.use(cors({ origin: env.cors.origins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
const api = env.api.prefix;

app.use(`${api}/auth`, authRoutes);
app.use(`${api}/videos`, requireAgeVerification, videoRoutes);
app.use(`${api}/categories`, categoryRoutes);
app.use(`${api}/tags`, tagRoutes);
app.use(`${api}/classifieds`, requireAgeVerification, classifiedRoutes);
app.use(`${api}/profiles`, profileRoutes);
app.use(`${api}/chat`, chatRoutes);
app.use(`${api}/user`, userRoutes);
app.use(`${api}/admin`, adminRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: env.isDev ? err.message : 'Internal server error',
  });
});

// Start server
async function start() {
  // Test database connection
  const dbConnected = await testConnection();
  if (!dbConnected) {
    logger.warn('Database not available - server starting without DB. Run migration when DB is ready.');
  }

  // Initialize WebSocket
  WebSocketService.init(server);

  // Start cron jobs
  CronService.start();

  server.listen(env.port, () => {
    logger.info(`Server running on port ${env.port}`);
    logger.info(`API prefix: ${env.api.prefix}`);
    logger.info(`Environment: ${env.nodeEnv}`);
    logger.info(`WebSocket available at ws://localhost:${env.port}/ws`);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down...');
  CronService.stop();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down...');
  CronService.stop();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

start().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});

export default app;
