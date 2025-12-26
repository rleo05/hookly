import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../middleware/auth.js';

export async function userRoutes(fastify: FastifyInstance) {
  fastify.get('/me', { preHandler: authMiddleware }, async (request, reply) => {
    return reply.send({ user: request.user });
  });
}
