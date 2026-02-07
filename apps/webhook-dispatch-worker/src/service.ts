import crypto from 'node:crypto';
import { safeGet, safeSet } from '@webhook-orchestrator/cache';
import { type Prisma, prisma } from '@webhook-orchestrator/database';
import type { MessagePropertyHeaders } from '@webhook-orchestrator/queue';
import { webhookDispatchConsumer, webhookDispatchProducer } from '@webhook-orchestrator/queue';
import type { WebhookDispatchPayload } from '@webhook-orchestrator/queue/constants';
import pLimit from 'p-limit';
import { request } from 'undici';
import client, { NotPublicIPError } from './http-client';

const MAX_RETRIES = 5;
const TTL_BASE = 15000;
const limit = pLimit(100);

export const dispatchWebhook = async (
  data: WebhookDispatchPayload,
  queueHeaders: MessagePropertyHeaders | undefined,
) => {
  const retryCount = webhookDispatchConsumer.getRetryCount(queueHeaders);

  try {
    // add new field to store start_processing_at
    const affectedRows = await prisma.$executeRaw`
    UPDATE "event_attempts"
    SET status = 'PROCESSING'
    WHERE id = ${data.attemptId} 
      AND (status = 'ENQUEUED'
        OR (NOW() - "created_at" > INTERVAL '15 seconds' AND status = 'PROCESSING'))
    `;

    if (affectedRows === 0) {
      console.warn(`event attempt ${data.attemptId} not found`);
      return;
    }

    let requestHeaders: Record<string, string> | undefined;
    if (data.headers) {
      requestHeaders = data.headers as Record<string, string>;
    }

    let payload: Prisma.JsonObject | null = null;

    const cachedPayload = await safeGet(`event:${data.eventId}`);
    if (cachedPayload) {
      payload = JSON.parse(cachedPayload);
    }

    if (!payload) {
      const event = await prisma.event.findUnique({
        select: { payload: true },
        where: { id: data.eventId },
      });

      if (!event) {
        console.error(`event ${data.eventId} not found`);
        return;
      }

      payload = event.payload as Prisma.JsonObject;

      await safeSet(`event:${data.eventId}`, JSON.stringify(payload), { NX: true, EX: 3600 });
    }

    const stringPayload = JSON.stringify(payload);

    const startTime = Date.now();
    const { statusCode, headers: responseHeaders } = await limit(() =>
      request(data.url, {
        method: data.method,
        // block dangerous headers on endpoint creation
        headers: {
          ...requestHeaders,
          'X-Signature': signPayload(stringPayload, data.secret),
        },
        body: stringPayload,
        dispatcher: client,
      }),
    );

    if (statusCode >= 300 && isRetryable(statusCode)) {
      await prisma.eventAttempt.update({
        data: {
          status: 'ENQUEUED',
          responseHeader: responseHeaders,
          responseCode: statusCode,
          durationMs: Date.now() - startTime,
          attemptNumber: retryCount + 1,
        },
        where: { id: data.attemptId },
      });

      throw new Error(`retryable status code: ${statusCode}`);
    }

    await prisma.eventAttempt.update({
      data: {
        status: statusCode < 300 ? 'COMPLETED' : 'FAILED',
        responseHeader: responseHeaders,
        responseCode: statusCode,
        durationMs: Date.now() - startTime,
        attemptNumber: retryCount + 1,
      },
      where: {
        id: data.attemptId,
        status: 'PROCESSING',
      },
    });
  } catch (error) {
    if (error instanceof NotPublicIPError) {
      console.error('webhook dispatch failed - not public IP:', error);
      await prisma.eventAttempt.update({
        data: { status: 'FAILED' },
        where: { id: data.attemptId },
      });
      return;
    }

    console.error(`error dispatching webhook ${data.attemptId}:`, error);

    // add more agressive backoff if 429 code
    if (retryCount < MAX_RETRIES) {
      const ttl = TTL_BASE * 2 ** retryCount;

      await webhookDispatchProducer
        .insertToRetryQueue(data, 10, ttl)
        .catch((err) => console.error('retry enqueue fail', err));
      return;
    }

    console.warn('max retries reached, sending to DLQ');
    await prisma.eventAttempt.update({
      data: { status: 'FAILED' },
      where: { id: data.attemptId },
    });
    throw error;
  }
};

const signPayload = (payload: string, secret: string) => {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  return hmac.digest('hex');
};

const isRetryable = (statusCode: number) => {
  const RETRYABLE = new Set([408, 429]);
  return statusCode >= 500 || RETRYABLE.has(statusCode);
};