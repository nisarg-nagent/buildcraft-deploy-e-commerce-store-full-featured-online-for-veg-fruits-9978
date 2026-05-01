import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { authService } from '../services/authService';
import { authenticate } from '../middleware/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

const authRoutes: FastifyPluginAsync = async (app) => {
  app.post('/login', async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const result = await authService.login(body.email, body.password, app);
    return reply.status(200).send({ success: true, data: result });
  });

  app.post('/refresh', async (request, reply) => {
    const body = refreshSchema.parse(request.body);
    const result = await authService.refresh(body.refreshToken, app);
    return reply.status(200).send({ success: true, data: result });
  });

  app.post('/logout', { preHandler: authenticate }, async (request, reply) => {
    const body = refreshSchema.parse(request.body);
    await authService.logout(body.refreshToken);
    return reply.status(204).send();
  });

  app.get('/me', { preHandler: authenticate }, async (request, reply) => {
    const user = await authService.getCurrentUser(request.user.sub);
    return reply.status(200).send({ success: true, data: user });
  });
};

export default authRoutes;