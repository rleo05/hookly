import { z } from 'zod';
import { ApiError } from '../../shared/errors.js';
import type { PaginationResult } from '../../shared/schema.js';
import { Prisma } from '@prisma/client';

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

export class EventTypeNotFound extends ApiError {
  constructor() {
    super(404, 'event type not found or disabled');
    this.name = 'EventTypeNotFound';
  }
}

export class EventTypeConflict extends ApiError {
  constructor() {
    super(409, 'event type with this name already exists');
    this.name = 'EventTypeConflict';
  }
}

export class EventTypeListNotFound extends ApiError {
  constructor(eventTypes: string[]) {
    super(404, `event types [${eventTypes.join(', ')}] not found or disabled`);
    this.name = 'EventTypeListNotFound';
  }
}

// events

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
  payload: Prisma.JsonValue;
  createdAt: Date;
};

export type EventListItem = Omit<EventItem, 'payload'>;

export type EventList = {
  events: EventListItem[];
  pagination: PaginationResult;
};

export class EventNotFound extends ApiError {
  constructor() {
    super(404, 'event not found');
    this.name = 'EventNotFound';
  }
}

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

export class EventExternalIdConflict extends ApiError {
  constructor() {
    super(409, 'event with this external id already exists');
    this.name = 'EventExternalIdConflict';
  }
}
