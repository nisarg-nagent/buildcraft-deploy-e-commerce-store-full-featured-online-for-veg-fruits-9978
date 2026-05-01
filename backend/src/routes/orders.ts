import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { orderService } from '../services/orderService';
import { authenticate, requireRole } from '../middleware/auth';

const createOrderSchema = z.object({
  addressId: z.string().uuid(),
  notes: z.string().optional(),
  deliveryPreference: z.string().optional(),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled']).optional(),
});

const statusUpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled']),
  cancellationReason: z.string().optional(),
});

const orderRoutes: FastifyPluginAsync = async (app) => {
  app.post('/', { preHandler: authenticate }, async (request, reply) => {
    const body = createOrderSchema.parse(request.body);
    const order = await orderService.create(request.user.sub, body);
    return reply.status(201).send({ success: true, data: order });
  });

  app.get('/', { preHandler: authenticate }, async (request, reply) => {
    const q = listQuerySchema.parse(request.query);
    const result = await orderService.listForUser(request.user.sub, q);
    return reply.send({ success: true, data: result.data, meta: result.meta });
  });

  app.get('/:id', { preHandler: authenticate }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const order = await orderService.getById(id, request.user.sub, request.user.role);
    return reply.send({ success: true, data: order });
  });

  app.patch('/:id/status', { preHandler: requireRole('admin') }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = statusUpdateSchema.parse(request.body);
    const order = await orderService.updateStatus(id, body.status, body.cancellationReason);
    return reply.send({ success: true, data: order });
  });
};

export default orderRoutes;