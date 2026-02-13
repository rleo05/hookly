import { ApiError } from '../../shared/errors.js';

export {
  type ApplicationUidQuery,
  applicationUidQuerySchema,
  type CreateEvent,
  type CreateEventType,
  createEventSchema,
  createEventTypeSchema,
  type EventItem,
  type EventList,
  type EventListItem,
  type EventTypeItem,
  type EventTypeNameParam,
  type EventTypesList,
  type EventUidParam,
  eventTypeNameParamSchema,
  eventUidParamSchema,
  type ListEventQuery,
  type ListEventTypeQuery,
  listEventQuerySchema,
  listEventTypeQuerySchema,
  type UpdateEventType,
  updateEventTypeSchema,
} from '@hookly/api-types';

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

export class EventNotFound extends ApiError {
  constructor() {
    super(404, 'event not found');
    this.name = 'EventNotFound';
  }
}

export class EventExternalIdConflict extends ApiError {
  constructor() {
    super(409, 'event with this external id already exists');
    this.name = 'EventExternalIdConflict';
  }
}
