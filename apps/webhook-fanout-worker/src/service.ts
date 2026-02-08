import { safeSet } from '@hookly/cache';
import { prisma } from '@hookly/database';
import type { MessagePropertyHeaders } from '@hookly/queue';
import {
  webhookDispatchProducer,
  webhookFanoutConsumer,
  webhookFanoutProducer,
} from '@hookly/queue';
import type { WebhookFanoutPayload } from '@hookly/queue/constants';
import pLimit from 'p-limit';

const MAX_RETRIES = 5;
const TTL_BASE = 15000;
const limit = pLimit(50);

export const processWebhookMessage = async (
  data: WebhookFanoutPayload,
  headers: MessagePropertyHeaders | undefined,
) => {
  try {
    const eventType = await prisma.eventType.findUnique({
      select: { id: true },
      where: {
        applicationId_name: {
          applicationId: data.applicationId,
          name: data.eventType,
        },
        disabled: false,
      },
    });

    if (!eventType) {
      console.error(`event type ${data.eventType} not found`);
      return;
    }

    const [event, endpointRoutings] = await Promise.all([
      prisma.event.findUnique({
        select: { payload: true },
        where: { id: data.eventId },
      }),
      prisma.endpointRouting.findMany({
        where: {
          applicationId: data.applicationId,
          eventTypeId: eventType.id,
          endpoint: { isActive: true },
        },
        select: {
          endpointId: true,
        },
      }),
    ]);

    if (!event) {
      console.error(`event ${data.eventId} not found`);
      return;
    }

    if (!endpointRoutings.length) {
      console.warn(`event ${data.eventId} has no endpoints`);
      return;
    }

    await safeSet(`event:${data.eventId}`, JSON.stringify(event.payload), {
      NX: true,
      EX: 60 * 60,
    });

    await prisma.eventAttempt.createMany({
      data: endpointRoutings.map((endpointRouting) => ({
        eventId: data.eventId,
        endpointId: endpointRouting.endpointId,
        status: 'WAITING',
        idempotencyKey: `initial:${endpointRouting.endpointId}:${data.eventId}`,
      })),
      skipDuplicates: true,
    });

    const attempts = await prisma.eventAttempt.findMany({
      where: {
        eventId: data.eventId,
        status: 'WAITING',
      },
      select: {
        id: true,
        endpoint: {
          select: {
            url: true,
            method: true,
            headers: true,
            secret: true,
          },
        },
      },
    });

    if (attempts.length === 0) {
      return;
    }

    const results = await Promise.allSettled(
      attempts.map((attempt) =>
        limit(async () => {
          try {
            await webhookDispatchProducer.dispatch({
              attemptId: attempt.id,
              eventId: data.eventId,
              eventUid: data.eventUid,
              url: attempt.endpoint.url,
              method: attempt.endpoint.method,
              headers: attempt.endpoint.headers,
              secret: attempt.endpoint.secret,
            });
          } catch (error) {
            console.error(`error dispatching job ${attempt.id}:`, error);
            return null;
          }
        }),
      ),
    );

    const successIds = results
      .map((res, index) => {
        if (res.status === 'fulfilled') return attempts[index].id;
        return null;
      })
      .filter((id): id is string => id !== null);

    if (successIds.length > 0) {
      await prisma.eventAttempt.updateMany({
        where: {
          id: {
            in: successIds,
          },
        },
        data: { status: 'ENQUEUED' },
      });
    }

    if (attempts.length !== successIds.length) {
      throw new Error(`partial dispatch for event ${data.eventId}`);
    }
  } catch (error) {
    console.error(`error processing event ${data.eventId}:`, error);

    const retryCount = webhookFanoutConsumer.getRetryCount(headers);

    if (retryCount < MAX_RETRIES) {
      const ttl = TTL_BASE * 2 ** retryCount;

      await webhookFanoutProducer
        .insertToRetryQueue(data, 10, ttl)
        .catch((err) => console.error('retry enqueue fail', err));
      return;
    }

    console.error('max retries reached, sending to DLQ');
    throw error;
  }
};
