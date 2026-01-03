import { z } from 'zod';
import { ApiError } from '../../shared/errors.js';
import type { PaginationResult } from '../../shared/schema.js';

export const createEventTypeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export type CreateEventType = z.infer<typeof createEventTypeSchema>;

export const updateEventTypeSchema = z.object({
  description: z.string().max(500),
});

export type UpdateEventType = z.infer<typeof updateEventTypeSchema>;

export const eventTypeParamSchema = z.object({
  applicationUid: z.string().min(1),
  eventTypeName: z.string().min(1),
});

export const applicationUidParamSchema = z.object({
  applicationUid: z.string().min(1),
});

export type EventTypeParam = z.infer<typeof eventTypeParamSchema>;

export type ApplicationUidParam = z.infer<typeof applicationUidParamSchema>;

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
    super(404, 'event type not found');
    this.name = 'EventTypeNotFound';
  }
}

export class EventTypeConflict extends ApiError {
  constructor() {
    super(409, 'event type with this name already exists');
    this.name = 'EventTypeConflict';
  }
}
