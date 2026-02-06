import { safeGet, safeSet } from '@webhook-orchestrator/cache';
import { type Prisma, prisma } from '@webhook-orchestrator/database';
import type { MessagePropertyHeaders } from '@webhook-orchestrator/queue';
import type { WebhookDispatchPayload } from '@webhook-orchestrator/queue/constants';
import { request } from 'undici';
import client, { NotPublicIPError } from './http-client';
import pLimit from 'p-limit';

const limit = pLimit(100);

export const dispatchWebhook = async (
  data: WebhookDispatchPayload,
  queueHeaders: MessagePropertyHeaders | undefined,
) => {
  // verify idempotency

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

    safeSet(`event:${data.eventId}`, JSON.stringify(payload), { NX: true, EX: 3600 });
  }

  try {
    const {
      statusCode,
      headers: responseHeaders,
      body,
    } = await limit(() => request(data.url, {
      method: data.method,
      headers: requestHeaders,
      body: JSON.stringify(payload),
      dispatcher: client,
    }));

    console.log(responseHeaders);
    console.log(statusCode);
    console.log(body);

    const responseData = await body.json();
  } catch (error) {
    if (error instanceof NotPublicIPError) {
      console.error('webhook dispatch failed', error);
      // ack message and insert event attempt with FAILED status
    }

    // throw error;
  }
};

const signPayload = (payload: Prisma.JsonObject, secret: string) => {
  //
}