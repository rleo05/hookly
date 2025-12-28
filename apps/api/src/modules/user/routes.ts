import type { FastifyInstance } from 'fastify';

export async function userRoutes(fastify: FastifyInstance) {
  fastify.get('/me', { preHandler: fastify.authenticate }, async (request, reply) => {
    return reply.send({ user: request.user });
  });
}
