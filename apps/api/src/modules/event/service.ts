import { Prisma } from '@prisma/client';
import prisma from '../../lib/prisma.js';
import type { Pagination } from '../../shared/schema.js';
import { generateNanoId } from '../../shared/utils.js';
import { findApplicationByUidAndUser } from '../application/service.js';
import {
  type CreateEvent,
  type CreateEventType,
  type EventItem,
  type EventList,
  EventNotFound,
  EventTypeConflict,
  EventTypeListNotFound,
  EventTypeNotFound,
  type EventTypesList,
  type ListEventQuery,
  type UpdateEventType,
  EventExternalIdConflict,
} from './schema.js';

// event types

export async function listEventTypes(
  userId: string,
  applicationUid: string,
  pagination: Pagination,
): Promise<EventTypesList> {
  const appId = await findApplicationByUidAndUser(applicationUid, userId);
  const wherePagination = {
    applicationId: appId,
  };
  const [eventTypes, total] = await prisma.$transaction([
    prisma.eventType.findMany({
      where: wherePagination,
      select: {
        name: true,
        description: true,
        createdAt: true,
        disabled: true,
      },
      skip: (pagination.page - 1) * pagination.size,
      take: pagination.size,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.eventType.count({
      where: wherePagination,
    }),
  ]);

  return {
    eventTypes,
    pagination: {
      page: pagination.page,
      size: pagination.size,
      total,
      totalPages: Math.ceil(total / pagination.size),
    },
  };
}

export async function getEventType(userId: string, applicationUid: string, eventTypeName: string) {
  const normalizedName = normalizeEventTypeName(eventTypeName);
  const appId = await findApplicationByUidAndUser(applicationUid, userId);
  const eventType = await prisma.eventType.findFirst({
    where: {
      name: normalizedName,
      applicationId: appId,
    },
    select: {
      name: true,
      description: true,
      createdAt: true,
      disabled: true,
    },
  });

  if (!eventType) {
    throw new EventTypeNotFound();
  }

  return eventType;
}

export async function createEventType(
  userId: string,
  applicationUid: string,
  { name, description, disabled }: CreateEventType,
) {
  const normalizedEventTypeName = normalizeEventTypeName(name);
  try {
    const appId = await findApplicationByUidAndUser(applicationUid, userId);

    return await prisma.eventType.create({
      data: {
        name: normalizedEventTypeName,
        description: description ?? null,
        disabled: disabled ?? false,
        applicationId: appId,
      },
      select: {
        name: true,
        description: true,
        createdAt: true,
        disabled: true,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new EventTypeConflict();
    }
    throw err;
  }
}

export async function updateEventType(
  userId: string,
  applicationUid: string,
  eventTypeName: string,
  { description, disabled }: UpdateEventType,
) {
  const normalizedName = normalizeEventTypeName(eventTypeName);
  const appId = await findApplicationByUidAndUser(applicationUid, userId);
  const existingEventType = await prisma.eventType.findFirst({
    where: {
      name: normalizedName,
      applicationId: appId,
    },
    select: {
      id: true,
    },
  });

  if (!existingEventType) {
    throw new EventTypeNotFound();
  }

  return await prisma.eventType.update({
    where: {
      id: existingEventType.id,
    },
    data: {
      ...(description !== undefined && { description }),
      ...(disabled !== undefined && { disabled }),
    },
    select: {
      name: true,
      description: true,
      createdAt: true,
      disabled: true,
    },
  });
}

export async function checkExistingEventTypes(eventTypes: string[], appId: string) {
  const foundEventTypes = await prisma.eventType.findMany({
    where: {
      applicationId: appId,
      name: {
        in: eventTypes,
      },
      disabled: false,
    },
    select: {
      name: true,
    },
  });

  if (foundEventTypes.length !== eventTypes.length) {
    const missingEventTypes = eventTypes.filter((e) => !foundEventTypes.find((f) => f.name === e));
    throw new EventTypeListNotFound(missingEventTypes);
  }
}

export function normalizeEventTypeName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_-]+/g, '.')
    .replace(/[^a-z0-9.]/g, '')
    .replace(/\.+/g, '.')
    .replace(/^\.|\.$/, '');
}

// events

const EVENT_PREFIX = 'evt_';

export async function listEvents(userId: string, query: ListEventQuery): Promise<EventList> {
  const applicationId = await findApplicationByUidAndUser(query.applicationUid, userId);

  const wherePagination = { applicationId };

  const [events, total] = await prisma.$transaction([
    prisma.event.findMany({
      where: wherePagination,
      skip: (query.page - 1) * query.size,
      take: query.size,
      select: {
        uid: true,
        eventType: true,
        externalId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.event.count({ where: wherePagination }),
  ]);

  return {
    events: events.map((e) => ({
      uid: e.uid,
      applicationUid: query.applicationUid,
      eventType: e.eventType,
      externalId: e.externalId ?? undefined,
      createdAt: e.createdAt,
    })),
    pagination: {
      page: query.page,
      size: query.size,
      total,
      totalPages: Math.ceil(total / query.size),
    },
  };
}

export async function getEvent(userId: string, uid: string): Promise<EventItem> {
  const event = await prisma.event.findFirst({
    where: {
      uid,
      application: {
        userId,
        deletedAt: null,
      },
    },
    select: {
      uid: true,
      eventType: true,
      externalId: true,
      payload: true,
      createdAt: true,
      application: {
        select: { uid: true },
      },
    },
  });

  if (!event) {
    throw new EventNotFound();
  }

  return {
    uid: event.uid,
    applicationUid: event.application.uid,
    eventType: event.eventType,
    externalId: event.externalId ?? undefined,
    payload: event.payload,
    createdAt: event.createdAt,
  };
}

export async function createEvent(
  userId: string,
  { applicationUid, eventType, externalId, payload }: CreateEvent,
): Promise<EventItem> {
  const uid = `${EVENT_PREFIX}${generateNanoId()}`;
  const appId = await findApplicationByUidAndUser(applicationUid, userId);
  try {
    const event = await prisma.event.create({
      data: {
        uid,
        applicationId: appId,
        eventType,
        externalId: externalId ?? null,
        payload,
      },
      select: {
        uid: true,
        eventType: true,
        externalId: true,
        payload: true,
        createdAt: true,
      },
    });

    return {
      uid: event.uid,
      applicationUid,
      externalId: event.externalId ?? undefined,
      eventType: event.eventType,
      payload: event.payload,
      createdAt: event.createdAt
    };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new EventExternalIdConflict();
    }
    throw err;
  }
}