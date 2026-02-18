import { Prisma, prisma } from '@hookly/database';
import type { Pagination } from '../../shared/schema.js';
import { generateNanoId } from '../../shared/utils.js';
import {
  ApplicationExternalIdConflict,
  type ApplicationItem,
  type ApplicationList,
  ApplicationNotFound,
  type CreateApplication,
  type UpdateApplication,
} from './schema.js';

const nanoidPrefix = 'app_';

export async function create(
  userId: string,
  { name, externalId }: CreateApplication,
): Promise<ApplicationItem> {
  try {
    const uid = `${nanoidPrefix}${generateNanoId()}`;
    const app = await prisma.application.create({
      data: {
        uid,
        name,
        userId,
        externalId: externalId ?? null,
      },
      select: {
        uid: true,
        externalId: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return { ...app, externalId: app.externalId ?? undefined };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new ApplicationExternalIdConflict();
    }
    throw err;
  }
}

type ListApplicationParams = Pagination & {
  search?: string | undefined;
};

export async function list(userId: string, params: ListApplicationParams): Promise<ApplicationList> {
  const { search, ...pagination } = params;

  const wherePagination: Prisma.ApplicationWhereInput = {
    userId,
    deletedAt: null,
  };

  if (search) {
    wherePagination.AND = {
      OR: [
        { uid: { contains: search, mode: 'insensitive' } },
        { externalId: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  const [apps, total] = await prisma.$transaction([
    prisma.application.findMany({
      where: wherePagination,
      skip: (pagination.page - 1) * pagination.size,
      take: pagination.size,
      select: {
        uid: true,
        externalId: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.application.count({
      where: wherePagination,
    }),
  ]);
  const paginationResult = {
    page: pagination.page,
    size: pagination.size,
    total,
    totalPages: Math.ceil(total / pagination.size),
  };

  return {
    applications: apps.map((app) => ({ ...app, externalId: app.externalId ?? undefined })),
    pagination: paginationResult,
  };
}

export async function get(userId: string, id: string) {
  const app = await prisma.application.findFirst({
    where: {
      uid: id,
      userId,
      deletedAt: null,
    },
    select: {
      uid: true,
      name: true,
      createdAt: true,
    },
  });

  if (!app) {
    throw new ApplicationNotFound();
  }

  return app;
}

export async function update(userId: string, uid: string, { name, externalId }: UpdateApplication) {
  try {
    const existingApp = await prisma.application.findFirst({
      where: {
        uid,
        userId,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!existingApp) {
      throw new ApplicationNotFound();
    }

    const updatedApp = await prisma.application.update({
      where: {
        id: existingApp.id,
      },
      data: {
        ...(name && { name }),
        ...(externalId !== undefined && { externalId }),
      },
      select: {
        uid: true,
        externalId: true,
        name: true,
        createdAt: true,
      },
    });

    return { ...updatedApp, externalId: updatedApp.externalId ?? undefined };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        throw new ApplicationExternalIdConflict();
      }
    }
    throw err;
  }
}

export async function remove(userId: string, uid: string) {
  const existingApp = await prisma.application.findFirst({
    where: { uid, userId, deletedAt: null },
    select: { id: true },
  });

  if (!existingApp) {
    throw new ApplicationNotFound();
  }

  await prisma.$transaction([
    prisma.endpointRouting.deleteMany({
      where: {
        applicationId: existingApp.id,
      },
    }),
    prisma.application.update({
      where: { id: existingApp.id },
      data: {
        deletedAt: new Date(),
      },
    }),
  ]);
}

export async function findApplicationByUidAndUser(uid: string, userId: string) {
  const app = await prisma.application.findFirst({
    where: {
      uid,
      userId,
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });

  if (!app) {
    throw new ApplicationNotFound();
  }

  return app.id;
}
