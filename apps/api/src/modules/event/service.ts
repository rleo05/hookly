import { Prisma } from '@prisma/client';
import prisma from '../../lib/prisma.js';
import type { Pagination } from '../../shared/schema.js';
import { findApplicationByUidAndUser } from '../application/service.js';
import {
  type CreateEventType,
  EventTypeConflict,
  EventTypeNotFound,
  type EventTypesList,
  type UpdateEventType,
} from './schema.js';

export async function listEventTypes(
  userId: string,
  applicationUid: string,
  pagination: Pagination,
): Promise<EventTypesList> {
  const appId = await findApplicationByUidAndUser(applicationUid, userId);
  const whereAppUser = {
    applicationId: appId,
  };
  const [eventTypes, total] = await prisma.$transaction([
    prisma.eventType.findMany({
      where: whereAppUser,
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
      where: whereAppUser,
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
  { name, description }: CreateEventType,
) {
  const normalizedEventTypeName = normalizeEventTypeName(name);
  try {
    const appId = await findApplicationByUidAndUser(applicationUid, userId);

    return await prisma.eventType.create({
      data: {
        name: normalizedEventTypeName,
        description: description ?? null,
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
    console.log(err);
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
  { description }: UpdateEventType,
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
      description,
    },
    select: {
      name: true,
      description: true,
      createdAt: true,
      disabled: true,
    },
  });
}

export async function disableEventType(
  userId: string,
  applicationUid: string,
  eventTypeName: string,
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
      name: true,
      description: true,
      createdAt: true,
      disabled: true,
    },
  });

  if (!existingEventType) {
    throw new EventTypeNotFound();
  }

  if (existingEventType.disabled) {
    return {
      name: existingEventType.name,
      description: existingEventType.description,
      createdAt: existingEventType.createdAt,
      disabled: existingEventType.disabled,
    };
  }

  return await prisma.eventType.update({
    where: { id: existingEventType.id },
    data: { disabled: true },
    select: {
      name: true,
      description: true,
      createdAt: true,
      disabled: true,
    },
  });
}

export async function enableEventType(
  userId: string,
  applicationUid: string,
  eventTypeName: string,
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
      name: true,
      description: true,
      createdAt: true,
      disabled: true,
    },
  });

  if (!existingEventType) {
    throw new EventTypeNotFound();
  }

  if (!existingEventType.disabled) {
    return {
      name: existingEventType.name,
      description: existingEventType.description,
      createdAt: existingEventType.createdAt,
      disabled: existingEventType.disabled,
    };
  }

  return await prisma.eventType.update({
    where: { id: existingEventType.id },
    data: { disabled: false },
    select: {
      name: true,
      description: true,
      createdAt: true,
      disabled: true,
    },
  });
}

function normalizeEventTypeName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_-]+/g, '.')
    .replace(/[^a-z0-9.]/g, '')
    .replace(/\.+/g, '.')
    .replace(/^\.|\.$/g, '');
}
