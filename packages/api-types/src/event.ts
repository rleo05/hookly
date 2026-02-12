import { z } from 'zod';
import type { PaginationResult } from './pagination.js';
import type { JsonValue } from './endpoint.js';

// Event Types

export const createEventTypeSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    disabled: z.boolean().optional(),
});

export type CreateEventType = z.infer<typeof createEventTypeSchema>;

export const updateEventTypeSchema = z.object({
    description: z.string().max(500).optional(),
    disabled: z.boolean().optional(),
});

export type UpdateEventType = z.infer<typeof updateEventTypeSchema>;

export const eventTypeNameParamSchema = z.object({
    eventTypeName: z.string().min(1),
});

export const applicationUidQuerySchema = z.object({
    applicationUid: z.string().min(1),
});

export const listEventTypeQuerySchema = z.object({
    applicationUid: z.string().min(1),
    page: z.coerce.number().min(1).default(1),
    size: z.coerce.number().min(1).max(100).default(10),
});

export type EventTypeNameParam = z.infer<typeof eventTypeNameParamSchema>;

export type ApplicationUidQuery = z.infer<typeof applicationUidQuerySchema>;

export type ListEventTypeQuery = z.infer<typeof listEventTypeQuerySchema>;

export type EventTypeItem = {
    name: string;
    description: string | null;
    createdAt: Date;
    disabled: boolean;
};

export type EventTypesList = {
    eventTypes: EventTypeItem[];
    pagination: PaginationResult;
};

// Events

export const listEventQuerySchema = z.object({
    applicationUid: z.string().min(1),
    page: z.coerce.number().min(1).default(1),
    size: z.coerce.number().min(1).max(100).default(10),
});

export type ListEventQuery = z.infer<typeof listEventQuerySchema>;

export const eventUidParamSchema = z.object({
    uid: z.string().min(1),
});

export type EventUidParam = z.infer<typeof eventUidParamSchema>;

export type EventItem = {
    uid: string;
    applicationUid: string;
    eventType: string;
    externalId: string | undefined;
    payload: JsonValue;
    createdAt: Date;
};

export type EventListItem = Omit<EventItem, 'payload'>;

export type EventList = {
    events: EventListItem[];
    pagination: PaginationResult;
};

export const createEventSchema = z.object({
    applicationUid: z.string().min(1),
    eventType: z.string().min(1),
    externalId: z.string().min(1).optional(),
    payload: z.record(z.string(), z.any()).refine(
        (obj) => {
            return Object.keys(obj).length > 0;
        },
        { error: 'payload must not be empty' },
    ),
});

export type CreateEvent = z.infer<typeof createEventSchema>;
