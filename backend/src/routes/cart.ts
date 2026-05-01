import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { cartService } from '../services/cartService';
import { authenticate } from '../middleware/auth';

const addItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1),
});

const updateItemSchema = z.object({
  quantity: z.number().int().min(1),
});

const cartRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', authenticate);

  app.get('/', async (request, reply) => {
    const cart = await cartService.getActiveCart(request.user.sub);
    return reply.send({ success: true, data: cart });
  });

  app.post('/items', async (request, reply) => {
    const body = addItemSchema.parse(request.body);
    const item = await cartService.addItem(request.user.sub, body.productId, body.quantity);
    return reply.status(201).send({ success: true, data: item });
  });

  app.put('/items/:itemId', async (request, reply) => {
    const { itemId } = z.object({ itemId: z.string().uuid() }).parse(request.params);
    const body = updateItemSchema.parse(request.body);
    const item = await cartService.updateItem(request.user.sub, itemId, body.quantity);
    return reply.send({ success: true, data: item });
  });

  app.delete('/items/:itemId', async (request, reply) => {
    const { itemId } = z.object({ itemId: z.string().uuid() }).parse(request.params);
    await cartService.removeItem(request.user.sub, itemId);
    return reply.status(204).send();
  });
};

export default cartRoutes;