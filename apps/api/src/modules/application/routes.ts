import type { FastifyInstance } from 'fastify';
import { type Pagination, paginationSchema } from '../../shared/schema.js';
import {
  ApplicationNotFound,
  type ApplicationParamId,
  applicationParamIdSchema,
  type CreateApplication,
  createApplicationSchema,
  type UpdateApplication,
  updateApplicationSchema,
} from './schema.js';
import * as applicationService from './service.js';

export default function applicationRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticateApiKey);

  fastify.post<{ Body: CreateApplication }>(
    '/',
    {
      schema: {
        body: createApplicationSchema,
      },
    },
    async (request, reply) => {
      const application = await applicationService.create(request.user!, request.body);
      reply.status(201).send(application);
    },
  );

  fastify.get<{ Querystring: Pagination }>(
    '/',
    {
      schema: {
        querystring: paginationSchema,
      },
    },
    async (request, reply) => {
      const applications = await applicationService.list(request.user!, request.query);
      reply.status(200).send(applications);
    },
  );

  fastify.get<{ Params: ApplicationParamId }>(
    '/:id',
    {
      schema: {
        params: applicationParamIdSchema,
      },
    },
    async (request, reply) => {
      const application = await applicationService.get(request.user!, request.params.id);

      if (!application) {
        throw new ApplicationNotFound();
      }

      reply.status(200).send(application);
    },
  );

  fastify.put<{ Params: ApplicationParamId; Body: UpdateApplication }>(
    '/:id',
    {
      schema: {
        params: applicationParamIdSchema,
        body: updateApplicationSchema,
      },
    },
    async (request, reply) => {
      const application = await applicationService.update(
        request.user!,
        request.params.id,
        request.body,
      );

      if (!application) {
        throw new ApplicationNotFound();
      }

      reply.status(200).send(application);
    },
  );

  fastify.delete<{ Params: ApplicationParamId }>(
    '/:id',
    {
      schema: {
        params: applicationParamIdSchema,
      },
    },
    async (request, reply) => {
      const deleted = await applicationService.remove(request.user!, request.params.id);

      if (!deleted) {
        throw new ApplicationNotFound();
      }

      reply.status(204).send();
    },
  );
}
