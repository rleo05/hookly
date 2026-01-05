import { z } from 'zod';
import { ApiError } from '../../shared/errors.js';
import type { PaginationResult } from '../../shared/schema.js';

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
