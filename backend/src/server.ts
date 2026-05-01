import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { registerRoutes } from './routes/index';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

async function bootstrap() {
  const app = Fastify({
    logger: false,
    trustProxy: true,
  });

  await connectDatabase();

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: env.FRONTEND_URL === '*' ? true : env.FRONTEND_URL.split(',').map((s) => s.trim()),
    credentials: true,
  });
  await app.register(jwt, { secret: env.JWT_SECRET });

  app.setErrorHandler(errorHandler);

  await registerRoutes(app);

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutting down...');
    try {
      await app.close();
      await disconnectDatabase();
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Error during shutdown');
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  try {
    await app.listen({ host: '0.0.0.0', port: env.PORT });
    logger.info(`Server listening on 0.0.0.0:${env.PORT}`);
  } catch (err) {
    logger.error({ err }, 'Failed to start server');
    process.exit(1);
  }
}

bootstrap().catch((err) => {
  logger.error({ err }, 'Fatal bootstrap error');
  process.exit(1);
});