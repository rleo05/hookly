import type { FastifyInstance } from 'fastify';
import { type Pagination, paginationSchema } from '../../shared/schema.js';
import {
  type ApplicationParamUid,
  applicationParamUidSchema,
  type CreateApplication,
  createApplicationSchema,
  type UpdateApplication,
  updateApplicationSchema,
} from './schema.js';
import * as applicationService from './service.js';

export default function applicationAppRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.post<{ Body: CreateApplication }>(
    '/',
    {
      schema: {
        body: createApplicationSchema,
      },
    },
    async (request, reply) => {
      const application = await applicationService.create(request.user!.id, request.body);
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
      const applications = await applicationService.list(request.user!.id, request.query);
      reply.status(200).send(applications);
    },
  );

  fastify.get<{ Params: ApplicationParamUid }>(
    '/:uid',
    {
      schema: {
        params: applicationParamUidSchema,
      },
    },
    async (request, reply) => {
      const application = await applicationService.get(request.user!.id, request.params.uid);
      reply.status(200).send(application);
    },
  );

  fastify.put<{ Params: ApplicationParamUid; Body: UpdateApplication }>(
    '/:uid',
    {
      schema: {
        params: applicationParamUidSchema,
        body: updateApplicationSchema,
      },
    },
    async (request, reply) => {
      const application = await applicationService.update(
        request.user!.id,
        request.params.uid,
        request.body,
      );
      reply.status(200).send(application);
    },
  );

  fastify.delete<{ Params: ApplicationParamUid }>(
    '/:uid',
    {
      schema: {
        params: applicationParamUidSchema,
      },
    },
    async (request, reply) => {
      await applicationService.remove(request.user!.id, request.params.uid);
      reply.status(204).send();
    },
  );
}
