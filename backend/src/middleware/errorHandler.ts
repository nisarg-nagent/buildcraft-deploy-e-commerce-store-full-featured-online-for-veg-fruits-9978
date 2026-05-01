import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: error.flatten() },
    });
  }

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      success: false,
      error: { code: error.code, message: error.message, details: error.details },
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return reply.status(409).send({
        success: false,
        error: { code: 'CONFLICT', message: 'Duplicate value violates unique constraint' },
      });
    }
    if (error.code === 'P2025') {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Record not found' },
      });
    }
  }

  const fe = error as FastifyError;
  if (fe.statusCode && fe.statusCode >= 400 && fe.statusCode < 500) {
    return reply.status(fe.statusCode).send({
      success: false,
      error: { code: fe.code || 'BAD_REQUEST', message: error.message },
    });
  }

  logger.error({ err: error, url: request.url, method: request.method }, 'Unhandled error');
  return reply.status(500).send({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
  });
}