import { FastifyPluginAsync } from 'fastify';
import { adminService } from '../services/adminService';
import { requireRole } from '../middleware/auth';

const adminRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', requireRole('admin'));

  app.get('/dashboard', async (_request, reply) => {
    const stats = await adminService.dashboard();
    return reply.send({ success: true, data: stats });
  });
};

export default adminRoutes;