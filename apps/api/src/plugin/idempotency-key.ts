import type { FastifyReply, FastifyRequest, FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { redis } from '../lib/redis.js';
import { CreateEvent } from '../modules/event/schema.js'
import crypto from 'node:crypto';
import { ApiError } from '../shared/errors.js';

declare module 'fastify' {
  interface FastifyInstance {
    idempotencyKeyPreHandler: (request: FastifyRequest<{ Body: CreateEvent }>, reply: FastifyReply) => Promise<FastifyReply | void>;
    idempotencyKeyOnSend: (request: FastifyRequest, reply: FastifyReply, payload: unknown) => Promise<unknown>;
  }
}

const IDEMPOTENCY_KEY_TTL = 12 * 60 * 60;

type IdempotencyData = {
  status: 'PROCESSING' | 'COMPLETED';
  hashedPayload: string;
  statusCode: number;
  body: any;
}

export const idempotencyKeyPlugin = fp(async (fastify: FastifyInstance) => {
  const idempotencyKeyPreHandler = async (request: FastifyRequest<{ Body: CreateEvent }>, reply: FastifyReply) => {
    const idempotencyKey = request.headers['idempotency-key'];
    if (!idempotencyKey) {
      return;
    }

    const redisKey = `idempotency-key:${request.user!.id}:${idempotencyKey}`;

    const rawCached = await redis.get(redisKey);
    const hashedPayload = generateHash(request.body);

    if (rawCached) {
      const cachedValue = JSON.parse(rawCached) as IdempotencyData;

      if (cachedValue.status === 'PROCESSING') {
        throw new IdempotencyKeyConflict();
      }

      if (cachedValue.hashedPayload !== hashedPayload) {
        throw new IdempotencyKeyInvalid();
      }

      reply.status(cachedValue.statusCode).send(cachedValue.body);
      return reply;
    }

    await redis.set(redisKey, JSON.stringify({ status: 'PROCESSING', hashedPayload: hashedPayload }), { EX: IDEMPOTENCY_KEY_TTL, NX: true });
    (request as any).idempotencyKey = redisKey;
  };

  const idempotencyKeyOnSend = async (request: FastifyRequest, reply: FastifyReply, payload: unknown): Promise<unknown> => {
    if ((request as any).idempotencyOnSendDone) {
      return payload;
    }
    (request as any).idempotencyOnSendDone = true;

    const redisKey = (request as any).idempotencyKey;
    if (!redisKey) {
      return payload;
    }

    if (reply.statusCode >= 500) {
      await redis.del(redisKey);
      return payload;
    }

    let body;
    try {
      body = typeof payload === 'string' ? JSON.parse(payload) : payload;
    } catch (e) {
      body = payload;
    }

    const currentHash = generateHash(request.body);

    await redis.set(redisKey, JSON.stringify({ status: 'COMPLETED', hashedPayload: currentHash, statusCode: reply.statusCode, body: body }), { KEEPTTL: true });

    return payload;
  };

  fastify.decorate('idempotencyKeyPreHandler', idempotencyKeyPreHandler);
  fastify.decorate('idempotencyKeyOnSend', idempotencyKeyOnSend);
});

const sortPayload = (payload: any): any => {
  if (typeof payload !== 'object' || payload === null) return payload;
  if (Array.isArray(payload)) return payload.map(sortPayload);
  return Object.keys(payload)
    .sort()
    .reduce((result: any, key: string) => {
      result[key] = sortPayload(payload[key]);
      return result;
    }, {});
};

const generateHash = (payload: any): string => {
  const sortedPayload = sortPayload({ applicationUid: payload.applicationUid, eventType: payload.eventType, payload: payload.payload });
  const stringPayload = JSON.stringify(sortedPayload);
  const hashedPayload = crypto.createHash('sha256').update(stringPayload).digest('hex');
  return hashedPayload;
}

export class IdempotencyKeyConflict extends ApiError {
  constructor() {
    super(409, 'event processing already in progress');
    this.name = 'IdempotencyKeyConflict';
  }
}

export class IdempotencyKeyInvalid extends ApiError {
  constructor() {
    super(422, 'invalid idempotency key for this payload');
    this.name = 'IdempotencyKeyInvalid';
  }
}

export default idempotencyKeyPlugin;