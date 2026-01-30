import crypto from 'node:crypto';
import { Prisma, prisma } from '@webhook-orchestrator/database';
import { generateNanoId } from '../../shared/utils.js';
import { findApplicationByUidAndUser } from '../application/service.js';
import { checkExistingEventTypes, normalizeEventTypeName } from '../event/service.js';
import {
  type CreateEndpoint,
  type EndpointItem,
  type EndpointList,
  EndpointNotFound,
  type EndpointResponse,
  type ListEndpointQuery,
  type UpdateEndpoint,
} from './schema.js';

const ID_PREFIX = 'end_';
const SECRET_PREFIX = 'whsec_';

type PrismaEndpointResult = {
  uid: string;
  url: string;
  method: string;
  headers: Prisma.JsonValue;
  description: string | null;
  eventTypes: string[];
  createdAt: Date;
  isActive: boolean;
};

function toEndpointItem(endpoint: PrismaEndpointResult): EndpointItem {
  return {
    uid: endpoint.uid,
    request: {
      url: endpoint.url,
      method: endpoint.method,
      ...(endpoint.headers && { headers: endpoint.headers }),
    },
    description: endpoint.description,
    eventTypes: endpoint.eventTypes,
    createdAt: endpoint.createdAt,
    isActive: endpoint.isActive,
  };
}

export async function create(
  userId: string,
  { applicationUid, request, description, eventTypes, secret, isActive }: CreateEndpoint,
): Promise<EndpointResponse> {
  const applicationId = await findApplicationByUidAndUser(applicationUid, userId);

  const plainSecret = secret ? secret : generateSecret();
  const uid = `${ID_PREFIX}${generateNanoId()}`;

  const normalizedEventTypes = eventTypes ? eventTypes.map((e) => normalizeEventTypeName(e)) : [];

  if (normalizedEventTypes.length) {
    await checkExistingEventTypes(normalizedEventTypes, applicationId);
  }

  const endpoint = await prisma.endpoint.create({
    data: {
      uid,
      applicationId,
      url: request.url,
      method: request.method ?? 'POST',
      headers: request.headers ?? Prisma.JsonNull,
      description: description ?? null,
      eventTypes: normalizedEventTypes,
      secret: plainSecret,
      isActive: isActive ?? true,
    },
    select: {
      uid: true,
      url: true,
      method: true,
      headers: true,
      description: true,
      eventTypes: true,
      createdAt: true,
      isActive: true,
    },
  });

  return {
    ...toEndpointItem(endpoint),
    secret: plainSecret,
  };
}

export async function get(userId: string, id: string): Promise<EndpointItem> {
  const endpoint = await prisma.endpoint.findFirst({
    where: {
      uid: id,
      application: {
        userId,
        deletedAt: null,
      },
      deletedAt: null,
    },
    select: {
      uid: true,
      url: true,
      method: true,
      headers: true,
      description: true,
      eventTypes: true,
      createdAt: true,
      isActive: true,
    },
  });

  if (!endpoint) {
    throw new EndpointNotFound();
  }

  return toEndpointItem(endpoint);
}

export async function list(userId: string, query: ListEndpointQuery): Promise<EndpointList> {
  const applicationId = await findApplicationByUidAndUser(query.applicationUid, userId);

  const wherePagination = {
    applicationId,
    deletedAt: null,
  };

  const [endpoints, total] = await prisma.$transaction([
    prisma.endpoint.findMany({
      where: wherePagination,
      skip: (query.page - 1) * query.size,
      take: query.size,
      select: {
        uid: true,
        url: true,
        method: true,
        headers: true,
        description: true,
        eventTypes: true,
        createdAt: true,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.endpoint.count({
      where: wherePagination,
    }),
  ]);

  return {
    endpoints: endpoints.map(toEndpointItem),
    pagination: {
      page: query.page,
      size: query.size,
      total,
      totalPages: Math.ceil(total / query.size),
    },
  };
}

export async function update(
  userId: string,
  id: string,
  { request, description, eventTypes, secret, isActive }: UpdateEndpoint,
) {
  const existingEndpoint = await prisma.endpoint.findFirst({
    where: {
      uid: id,
      application: {
        userId,
        deletedAt: null,
      },
      deletedAt: null,
    },
    select: { id: true, applicationId: true },
  });

  if (!existingEndpoint) {
    throw new EndpointNotFound();
  }

  const normalizedEventTypes = eventTypes ? eventTypes.map((e) => normalizeEventTypeName(e)) : [];

  if (normalizedEventTypes.length) {
    await checkExistingEventTypes(normalizedEventTypes, existingEndpoint.applicationId);
  }

  const updatedEndpoint = await prisma.endpoint.update({
    where: { id: existingEndpoint.id },
    data: {
      ...(request.url && { url: request.url }),
      ...(request.method && { method: request.method }),
      ...(request.headers && { headers: request.headers }),
      ...(description !== undefined && { description }),
      ...(eventTypes !== undefined && { eventTypes: normalizedEventTypes }),
      ...(secret && { secret }),
      ...(isActive !== undefined && { isActive }),
    },
    select: {
      uid: true,
      url: true,
      description: true,
      method: true,
      headers: true,
      eventTypes: true,
      createdAt: true,
      isActive: true,
    },
  });


  if (secret) {
    return {
      ...toEndpointItem(updatedEndpoint),
      secret,
    };
  }

  return toEndpointItem(updatedEndpoint);
}

export async function remove(userId: string, id: string) {
  const existingEndpoint = await prisma.endpoint.findFirst({
    where: {
      uid: id,
      deletedAt: null,
      application: {
        userId,
        deletedAt: null,
      },
    },
    select: { id: true, deletedAt: true },
  });

  if (!existingEndpoint) {
    throw new EndpointNotFound();
  }

  await prisma.endpoint.update({
    where: { id: existingEndpoint.id },
    data: { deletedAt: new Date(), isActive: false },
  });
}

function generateSecret() {
  return `${SECRET_PREFIX}${crypto.randomBytes(32).toString('hex')}`;
}
