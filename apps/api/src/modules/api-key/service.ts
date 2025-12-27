import crypto from 'node:crypto';
import { Prisma } from '@prisma/client';
import { env } from '../../config/env.js';
import prisma from '../../lib/prisma.js';
import {
  ApiKeyLimitError,
  type ApiKeyListResponse,
  type ApiKeyResponse,
  type CreateApiKeyParams,
} from './schema.js';

const KEY_PREFIX = 'whook';
const RETRY_UNIQUE_KEY = 2;
const MAX_ACTIVE_KEYS = 1;

export async function create({ name, userId }: CreateApiKeyParams): Promise<ApiKeyResponse> {
  const activeKeysCount = await prisma.apiKey.count({
    where: { userId, revokedAt: null },
  });

  if (activeKeysCount >= MAX_ACTIVE_KEYS) {
    throw new ApiKeyLimitError();
  }

  for (let i = 0; i < RETRY_UNIQUE_KEY; i++) {
    const raw = crypto.randomBytes(32).toString('hex');
    const keyId = raw.slice(0, 8);
    const secret = raw.slice(8);

    try {
      const keyHash = crypto.createHmac('sha256', env.API_KEY_SECRET).update(secret).digest('hex');

      const apiKey = await prisma.apiKey.create({
        data: { name, keyHash, keyId, userId },
      });

      return {
        key: {
          id: apiKey.id,
          value: `${KEY_PREFIX}_${keyId}_${secret}`,
          name,
          createdAt: apiKey.createdAt,
        },
      };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        continue;
      }
      throw err;
    }
  }

  throw new Error('failed to create api key');
}

export async function list(userId: string): Promise<ApiKeyListResponse> {
  const keys = await prisma.apiKey.findMany({
    where: { userId, revokedAt: null },
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return { keys };
}

export async function revoke(id: string, userId: string): Promise<boolean> {
  const result = await prisma.apiKey.updateMany({
    where: { id, userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  return result.count > 0;
}
