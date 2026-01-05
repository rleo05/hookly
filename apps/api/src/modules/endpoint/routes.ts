import type { FastifyInstance } from 'fastify';
import {
  type CreateEndpoint,
  createEndpointSchema,
  type EndpointParamId,
  endpointParamIdSchema,
  type ListEndpointQuery,
  listEndpointQuerySchema,
  type UpdateEndpoint,
  updateEndpointSchema,
} from './schema.js';
import * as endpointService from './service.js';

export default function endpointRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticateApiKey);

  fastify.post<{ Body: CreateEndpoint }>(
    '/',
    {
      schema: {
        body: createEndpointSchema,
      },
    },
    async (request, reply) => {
      const endpoint = await endpointService.create(request.user!.id, request.body);
      reply.status(201).send(endpoint);
    },
  );

  fastify.get<{ Querystring: ListEndpointQuery }>(
    '/',
    {
      schema: {
        querystring: listEndpointQuerySchema,
      },
    },
    async (request, reply) => {
      const result = await endpointService.list(request.user!.id, request.query);
      reply.status(200).send(result);
    },
  );

  fastify.get<{ Params: EndpointParamId }>(
    '/:id',
    {
      schema: {
        params: endpointParamIdSchema,
      },
    },
    async (request, reply) => {
      const endpoint = await endpointService.get(request.user!.id, request.params.id);
      reply.status(200).send(endpoint);
    },
  );

  fastify.put<{ Params: EndpointParamId; Body: UpdateEndpoint }>(
    '/:id',
    {
      schema: {
        params: endpointParamIdSchema,
        body: updateEndpointSchema,
      },
    },
    async (request, reply) => {
      const endpoint = await endpointService.update(
        request.user!.id,
        request.params.id,
        request.body,
      );
      reply.status(200).send(endpoint);
    },
  );

  fastify.delete<{ Params: EndpointParamId }>(
    '/:id',
    {
      schema: {
        params: endpointParamIdSchema,
      },
    },
    async (request, reply) => {
      await endpointService.remove(request.user!.id, request.params.id);
      reply.status(204).send();
    },
  );
}
