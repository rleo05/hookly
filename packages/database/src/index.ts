import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function pingDatabase(): Promise<void> {
    await prisma.$queryRaw`SELECT 1`;
}

export async function shutdownDatabase(): Promise<void> {
    await prisma.$disconnect();
}

export { Prisma, PrismaClient } from '@prisma/client';
export type * from '@prisma/client';
