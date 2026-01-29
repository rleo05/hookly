import crypto from 'node:crypto';
import { Prisma, prisma } from '@webhook-orchestrator/database';
import { env } from '@webhook-orchestrator/env';
import type { Pagination } from '../../shared/schema.js';
import {
  ApiKeyLimitError,
  type ApiKeyListResponse,
  type ApiKeyResponse,
  type CreateApiKeyParams,
} from './schema.js';

const KEY_PREFIX = 'whook';
const RETRY_UNIQUE_KEY = 3;
const MAX_ACTIVE_KEYS = 15;

export async function create({ name, userId }: CreateApiKeyParams): Promise<ApiKeyResponse> {
  const activeKeysCount = await prisma.apiKey.count({
    where: { userId, revokedAt: null },
  });

  if (activeKeysCount >= MAX_ACTIVE_KEYS) {
    throw new ApiKeyLimitError();
  }

  for (let i = 0; i < RETRY_UNIQUE_KEY; i++) {
    const keyId = crypto.randomBytes(8).toString('hex');
    const secret = crypto.randomBytes(32).toString('hex');

    try {
      const keyHash = crypto
        .createHmac('sha256', env.auth.API_KEY_SECRET)
        .update(secret)
        .digest('hex');

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

export async function list(userId: string, pagination: Pagination): Promise<ApiKeyListResponse> {
  const [keys, total] = await prisma.$transaction([
    prisma.apiKey.findMany({
      where: { userId, revokedAt: null },
      select: {
        id: true,
        keyId: true,
        name: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (pagination.page - 1) * pagination.size,
      take: pagination.size,
    }),
    prisma.apiKey.count({
      where: { userId, revokedAt: null },
    }),
  ]);

  const paginationResult = {
    page: pagination.page,
    size: pagination.size,
    total,
    totalPages: Math.ceil(total / pagination.size),
  };

  return { keys, pagination: paginationResult };
}

export async function revoke(id: string, userId: string): Promise<boolean> {
  const result = await prisma.apiKey.updateMany({
    where: { id, userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  return result.count > 0;
}

export async function validate(key: string) {
  const parts = key.split('_');
  if (parts.length !== 3) {
    return null;
  }

  const [prefix, keyId, secret] = parts;

  if (prefix !== KEY_PREFIX) {
    return null;
  }

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyId },
    select: {
      keyHash: true,
      revokedAt: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          emailVerified: true,
          image: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!apiKey || apiKey.revokedAt) {
    return null;
  }

  const keyHashRequest = crypto
    .createHmac('sha256', env.auth.API_KEY_SECRET)
    .update(secret)
    .digest('hex');

  if (apiKey.keyHash.length !== keyHashRequest.length) {
    return null;
  }

  const isValid = crypto.timingSafeEqual(
    Buffer.from(apiKey.keyHash, 'hex'),
    Buffer.from(keyHashRequest, 'hex'),
  );

  return isValid ? apiKey.user : null;
}
