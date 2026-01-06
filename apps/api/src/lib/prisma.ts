import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { env } from '../config/env.js';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const pool = new Pool({ connectionString: env.DATABASE_URL, max: 20 });
const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (env.APP_ENV !== 'prod') {
  globalForPrisma.prisma = prisma;
}

export async function pingDatabase() {
  await prisma.$queryRaw`SELECT 1`;
}

export async function shutdownDatabase() {
  await prisma.$disconnect();
}

export default prisma;
