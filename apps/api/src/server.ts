import 'dotenv/config';
import app from './app';
import env from './config/env';
import logger from './utils/logger';

const server = app.listen(env.PORT, () => {
  logger.info(`🛍️  Vaish&Co. API running on port ${env.PORT}`);
  logger.info(`📚 API Docs: http://localhost:${env.PORT}/api-docs`);
  logger.info(`💊 Health: http://localhost:${env.PORT}/health`);
  logger.info(`🌍 Environment: ${env.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
  process.exit(1);
});

export default server;
