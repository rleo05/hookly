import { Prisma } from '@prisma/client';
import type { User } from '../../lib/better-auth.js';
import prisma from '../../lib/prisma.js';
import type { Pagination } from '../../shared/schema.js';
import { generateNanoId } from '../../shared/utils.js';
import {
  ApplicationIDConflict,
  type ApplicationList,
  type CreateApplication,
  type UpdateApplication,
} from './schema.js';

const nanoidPrefix = 'app_';

export async function create(user: User, { name, externalId }: CreateApplication) {
  try {
    const uid = externalId ?? `${nanoidPrefix}${generateNanoId()}`;
    return await prisma.application.create({
      data: {
        uid,
        name,
        userId: user.id,
      },
      select: {
        uid: true,
        name: true,
        createdAt: true,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new ApplicationIDConflict();
    }
    throw err;
  }
}

export async function list(user: User, pagination: Pagination): Promise<ApplicationList> {
  const [applications, total] = await prisma.$transaction([
    prisma.application.findMany({
      where: {
        userId: user.id,
        deletedAt: null,
      },
      skip: (pagination.page - 1) * pagination.size,
      take: pagination.size,
      select: {
        uid: true,
        name: true,
        createdAt: true,
      },
    }),
    prisma.application.count({
      where: {
        userId: user.id,
        deletedAt: null,
      },
    }),
  ]);
  const paginationResult = {
    page: pagination.page,
    size: pagination.size,
    total,
    totalPages: Math.ceil(total / pagination.size),
  };

  return {
    applications,
    pagination: paginationResult,
  };
}

export async function get(user: User, id: string) {
  return await prisma.application.findFirst({
    where: {
      uid: id,
      userId: user.id,
      deletedAt: null,
    },
    select: {
      uid: true,
      name: true,
      createdAt: true,
    },
  });
}

export async function update(user: User, id: string, { name, externalId }: UpdateApplication) {
  try {
    const existingApp = await prisma.application.findFirst({
      where: {
        uid: id,
        userId: user.id,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!existingApp) {
      return null;
    }

    return await prisma.application.update({
      where: {
        id: existingApp.id,
      },
      data: {
        ...(name && { name }),
        ...(externalId && { uid: externalId }),
      },
      select: {
        uid: true,
        name: true,
        createdAt: true,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        throw new ApplicationIDConflict();
      }
    }
    throw err;
  }
}

export async function remove(user: User, id: string) {
  const existingApp = await prisma.application.findFirst({
    where: { uid: id, userId: user.id, deletedAt: null },
    select: { id: true },
  });

  if (!existingApp) return false;

  await prisma.application.update({
    where: { id: existingApp.id },
    data: {
      deletedAt: new Date(),
    },
  });

  return true;
}
