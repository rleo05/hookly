import type { FastifyInstance } from 'fastify';
import {
  apiKeyCreateSchema,
  ApiKeyLimitError,
  type ApiKeyCreate,
  apiKeyDeleteSchema,
  type ApiKeyDelete
} from './schema.js';
import * as apiKeyService from './service.js'

export async function apiKeyRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.post<{ Body: ApiKeyCreate }>('/', {
    schema: { body: apiKeyCreateSchema }
  }, async (request, reply) => {
    try {
      const apiKey = await apiKeyService.create({
        name: request.body.name,
        userId: request.user!.id,
      });
      return reply.status(201).send(apiKey);
    } catch (error) {
      if (error instanceof ApiKeyLimitError) {
        return reply.status(429).send({ message: error.message });
      }
      throw error;
    }
  });

  fastify.get('/', async (request, reply) => {
    const keys = await apiKeyService.list(request.user!.id);
    return reply.send(keys);
  });

  fastify.delete<{ Params: ApiKeyDelete }>('/:id', {
    schema: { params: apiKeyDeleteSchema }
  }, async (request, reply) => {
    const revoked = await apiKeyService.revoke(request.params.id, request.user!.id);

    if (!revoked) {
      return reply.status(404).send({ message: 'api key not found or already revoked' });
    }

    return reply.status(204).send();
  });
}

