import type { FastifyInstance } from 'fastify';
import { type Pagination, paginationSchema } from '../../shared/schema.js';
import {
  type ApplicationUidParam,
  applicationUidParamSchema,
  type CreateEventType,
  createEventTypeSchema,
  type EventTypeParam,
  eventTypeParamSchema,
  type UpdateEventType,
  updateEventTypeSchema,
} from './schema.js';
import * as eventService from './service.js';

export default function eventRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticateApiKey);

  fastify.register(
    async function eventTypesRoutes(instance: FastifyInstance) {
      instance.get<{ Params: ApplicationUidParam; Querystring: Pagination }>(
        '/:applicationUid',
        {
          schema: {
            params: applicationUidParamSchema,
            querystring: paginationSchema,
          },
        },
        async (request, reply) => {
          const eventTypes = await eventService.listEventTypes(
            request.user!.id,
            request.params.applicationUid,
            request.query,
          );
          reply.status(200).send(eventTypes);
        },
      );

      instance.get<{ Params: EventTypeParam }>(
        '/:applicationUid/:eventTypeName',
        {
          schema: {
            params: eventTypeParamSchema,
          },
        },
        async (request, reply) => {
          const eventType = await eventService.getEventType(
            request.user!.id,
            request.params.applicationUid,
            request.params.eventTypeName,
          );
          reply.status(200).send(eventType);
        },
      );

      instance.post<{ Params: ApplicationUidParam; Body: CreateEventType }>(
        '/:applicationUid',
        {
          schema: {
            params: applicationUidParamSchema,
            body: createEventTypeSchema,
          },
        },
        async (request, reply) => {
          const eventType = await eventService.createEventType(
            request.user!.id,
            request.params.applicationUid,
            request.body,
          );
          reply.status(201).send(eventType);
        },
      );

      instance.put<{ Params: EventTypeParam; Body: UpdateEventType }>(
        '/:applicationUid/:eventTypeName',
        {
          schema: {
            params: eventTypeParamSchema,
            body: updateEventTypeSchema,
          },
        },
        async (request, reply) => {
          const eventType = await eventService.updateEventType(
            request.user!.id,
            request.params.applicationUid,
            request.params.eventTypeName,
            request.body,
          );
          reply.status(200).send(eventType);
        },
      );

      instance.post<{ Params: EventTypeParam }>(
        '/:applicationUid/:eventTypeName/disable',
        {
          schema: {
            params: eventTypeParamSchema,
          },
        },
        async (request, reply) => {
          const eventType = await eventService.disableEventType(
            request.user!.id,
            request.params.applicationUid,
            request.params.eventTypeName,
          );
          reply.status(200).send(eventType);
        },
      );

      instance.post<{ Params: EventTypeParam }>(
        '/:applicationUid/:eventTypeName/enable',
        {
          schema: {
            params: eventTypeParamSchema,
          },
        },
        async (request, reply) => {
          const eventType = await eventService.enableEventType(
            request.user!.id,
            request.params.applicationUid,
            request.params.eventTypeName,
          );
          reply.status(200).send(eventType);
        },
      );
    },
    { prefix: '/event-type' },
  );
}
