import type { FastifyInstance } from 'fastify';
import { type Pagination, paginationSchema } from '../../commons/schema.js';
import {
  type ApiKeyCreate,
  type ApiKeyDelete,
  apiKeyCreateSchema,
  apiKeyDeleteSchema,
} from './schema.js';
import * as apiKeyService from './service.js';

export async function apiKeyRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.post<{ Body: ApiKeyCreate }>(
    '/',
    {
      schema: { body: apiKeyCreateSchema },
    },
    async (request, reply) => {
      const apiKey = await apiKeyService.create({
        name: request.body.name,
        userId: request.user!.id,
      });
      return reply.status(201).send(apiKey);
    },
  );

  fastify.get<{ Querystring: Pagination }>(
    '/',
    {
      schema: { querystring: paginationSchema },
    },
    async (request, reply) => {
      const keys = await apiKeyService.list(request.user!.id, request.query);
      return reply.send(keys);
    },
  );

  fastify.delete<{ Params: ApiKeyDelete }>(
    '/:id',
    {
      schema: { params: apiKeyDeleteSchema },
    },
    async (request, reply) => {
      const revoked = await apiKeyService.revoke(request.params.id, request.user!.id);

      if (!revoked) {
        return reply.status(404).send({ message: 'api key not found or already revoked' });
      }

      return reply.status(204).send();
    },
  );
}
