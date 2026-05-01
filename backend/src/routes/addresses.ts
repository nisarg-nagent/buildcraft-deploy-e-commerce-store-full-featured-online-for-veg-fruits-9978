import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { addressService } from '../services/addressService';
import { authenticate } from '../middleware/auth';

const createSchema = z.object({
  label: z.string().max(50).optional(),
  street: z.string().min(1).max(255),
  apartment: z.string().max(100).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  zipCode: z.string().min(1).max(20),
  country: z.string().max(3).default('IN'),
  isDefault: z.boolean().default(false),
});

const updateSchema = createSchema.partial();

const addressRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', authenticate);

  app.get('/', async (request, reply) => {
    const list = await addressService.listForUser(request.user.sub);
    return reply.send({ success: true, data: list });
  });

  app.post('/', async (request, reply) => {
    const body = createSchema.parse(request.body);
    const address = await addressService.create(request.user.sub, body);
    return reply.status(201).send({ success: true, data: address });
  });

  app.put('/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = updateSchema.parse(request.body);
    const address = await addressService.update(request.user.sub, id, body);
    return reply.send({ success: true, data: address });
  });

  app.delete('/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    await addressService.remove(request.user.sub, id);
    return reply.status(204).send();
  });
};

export default addressRoutes;