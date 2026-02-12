import type { FastifyInstance } from 'fastify';
import {
    type ApplicationUidQuery,
    applicationUidQuerySchema,
    type CreateEventType,
    createEventTypeSchema,
    type EventTypeNameParam,
    type EventUidParam,
    eventTypeNameParamSchema,
    eventUidParamSchema,
    type ListEventQuery,
    type ListEventTypeQuery,
    listEventQuerySchema,
    listEventTypeQuerySchema,
    type UpdateEventType,
    updateEventTypeSchema,
} from './schema.js';
import * as eventService from './service.js';

export default function eventAppRoutes(fastify: FastifyInstance) {
    fastify.addHook('preHandler', fastify.authenticate);

    // event Types

    fastify.register(
        async function eventTypesRoutes(instance: FastifyInstance) {
            instance.get<{ Querystring: ListEventTypeQuery }>(
                '/',
                {
                    schema: {
                        querystring: listEventTypeQuerySchema,
                    },
                },
                async (request, reply) => {
                    const eventTypes = await eventService.listEventTypes(
                        request.user!.id,
                        request.query.applicationUid,
                        request.query,
                    );
                    reply.status(200).send(eventTypes);
                },
            );

            instance.get<{ Params: EventTypeNameParam; Querystring: ApplicationUidQuery }>(
                '/:eventTypeName',
                {
                    schema: {
                        params: eventTypeNameParamSchema,
                        querystring: applicationUidQuerySchema,
                    },
                },
                async (request, reply) => {
                    const eventType = await eventService.getEventType(
                        request.user!.id,
                        request.query.applicationUid,
                        request.params.eventTypeName,
                    );
                    reply.status(200).send(eventType);
                },
            );

            instance.post<{ Querystring: ApplicationUidQuery; Body: CreateEventType }>(
                '/',
                {
                    schema: {
                        querystring: applicationUidQuerySchema,
                        body: createEventTypeSchema,
                    },
                },
                async (request, reply) => {
                    const eventType = await eventService.createEventType(
                        request.user!.id,
                        request.query.applicationUid,
                        request.body,
                    );
                    reply.status(201).send(eventType);
                },
            );

            instance.put<{
                Params: EventTypeNameParam;
                Querystring: ApplicationUidQuery;
                Body: UpdateEventType;
            }>(
                '/:eventTypeName',
                {
                    schema: {
                        params: eventTypeNameParamSchema,
                        querystring: applicationUidQuerySchema,
                        body: updateEventTypeSchema,
                    },
                },
                async (request, reply) => {
                    const eventType = await eventService.updateEventType(
                        request.user!.id,
                        request.query.applicationUid,
                        request.params.eventTypeName,
                        request.body,
                    );
                    reply.status(200).send(eventType);
                },
            );
        },
        { prefix: '/event-type' },
    );

    // events
    
    fastify.register(
        async function eventsRoutes(instance: FastifyInstance) {
            instance.get<{ Querystring: ListEventQuery }>(
                '/',
                {
                    schema: {
                        querystring: listEventQuerySchema,
                    },
                },
                async (request, reply) => {
                    const events = await eventService.listEvents(request.user!.id, request.query);
                    reply.status(200).send(events);
                },
            );

            instance.get<{ Params: EventUidParam }>(
                '/:uid',
                {
                    schema: {
                        params: eventUidParamSchema,
                    },
                },
                async (request, reply) => {
                    const event = await eventService.getEvent(request.user!.id, request.params.uid);
                    reply.status(200).send(event);
                },
            );
        },
        { prefix: '/event' },
    );
}
