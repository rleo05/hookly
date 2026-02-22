import type { FastifyInstance } from 'fastify';
import { type DashboardQuery, dashboardQuerySchema } from './schema.js';
import * as dashboardService from './service.js';

export default function dashboardAppRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.get<{ Querystring: DashboardQuery }>(
    '/',
    {
      schema: {
        querystring: dashboardQuerySchema,
      },
    },
    async (request, reply) => {
      const data = await dashboardService.getDashboardData(
        request.user!.id,
        request.query.startDate,
        request.query.endDate,
      );
      reply.status(200).send(data);
    },
  );
}
