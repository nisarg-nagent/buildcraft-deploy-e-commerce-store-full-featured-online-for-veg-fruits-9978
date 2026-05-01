import { FastifyInstance } from 'fastify';
import healthRoutes from './health';
import authRoutes from './auth';
import productRoutes from './products';
import cartRoutes from './cart';
import orderRoutes from './orders';
import addressRoutes from './addresses';
import adminRoutes from './admin';

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  await app.register(healthRoutes, { prefix: '/api' });
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(productRoutes, { prefix: '/api/products' });
  await app.register(cartRoutes, { prefix: '/api/cart' });
  await app.register(orderRoutes, { prefix: '/api/orders' });
  await app.register(addressRoutes, { prefix: '/api/addresses' });
  await app.register(adminRoutes, { prefix: '/api/admin' });
}