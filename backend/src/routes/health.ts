import { FastifyPluginAsync } from 'fastify';

const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async () => ({
    success: true,
    data: {
      status: 'ok',
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      timestamp: new Date().toISOString(),
      currency: 'INR',
    },
  }));
};

export default healthRoutes;