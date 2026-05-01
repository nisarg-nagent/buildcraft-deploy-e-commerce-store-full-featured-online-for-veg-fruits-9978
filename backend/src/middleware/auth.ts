import { FastifyReply, FastifyRequest } from 'fastify';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      sub: string;
      email: string;
      role: 'customer' | 'admin';
    };
    user: {
      sub: string;
      email: string;
      role: 'customer' | 'admin';
    };
  }
}

export async function authenticate(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  try {
    await request.jwtVerify();
  } catch {
    throw new UnauthorizedError('Invalid or missing authentication token');
  }
}

export function requireRole(...roles: Array<'customer' | 'admin'>) {
  return async function (request: FastifyRequest, reply: FastifyReply): Promise<void> {
    await authenticate(request, reply);
    const user = request.user;
    if (!user || !roles.includes(user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }
  };
}