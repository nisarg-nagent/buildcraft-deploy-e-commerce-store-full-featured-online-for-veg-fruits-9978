import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { productService } from '../services/productService';
import { authenticate, requireRole } from '../middleware/auth';

const listQuerySchema = z.object({
  category: z.string().optional(),
  organic: z.coerce.boolean().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
});

const createSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1),
  price: z.number().int().nonnegative(),
  unit: z.enum(['kg', 'g', 'piece', 'bunch', 'dozen']).default('piece'),
  stockQuantity: z.number().int().nonnegative().default(0),
  isOrganic: z.boolean().default(false),
  origin: z.string().optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
});

const updateSchema = createSchema.partial();

const productRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', { preHandler: authenticate }, async (request, reply) => {
    const q = listQuerySchema.parse(request.query);
    const result = await productService.list(q);
    return reply.send({ success: true, data: result.data, meta: result.meta });
  });

  app.get('/:id', { preHandler: authenticate }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const product = await productService.getById(id);
    return reply.send({ success: true, data: product });
  });

  app.post('/', { preHandler: requireRole('admin') }, async (request, reply) => {
    const body = createSchema.parse(request.body);
    const product = await productService.create(body);
    return reply.status(201).send({ success: true, data: product });
  });

  app.put('/:id', { preHandler: requireRole('admin') }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = updateSchema.parse(request.body);
    const product = await productService.update(id, body);
    return reply.send({ success: true, data: product });
  });

  app.delete('/:id', { preHandler: requireRole('admin') }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    await productService.remove(id);
    return reply.status(204).send();
  });
};

export default productRoutes;