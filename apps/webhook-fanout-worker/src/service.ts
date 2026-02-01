import pLimit from 'p-limit';
import { InsertEventPayload } from '@webhook-orchestrator/queue/constants';
import { Prisma, prisma } from '@webhook-orchestrator/database';
import type { MessagePropertyHeaders } from '@webhook-orchestrator/queue';
import { webhookProducer, webhookConsumer } from '@webhook-orchestrator/queue';

const MAX_RETRIES = 5;
const TTL_BASE = 30000;
const limit = pLimit(50);

export const processWebhookMessage = async (
  data: InsertEventPayload,
  headers: MessagePropertyHeaders | undefined
) => {
  try {
    const [event, endpoints] = await Promise.all([
      prisma.event.findUnique({
        select: { payload: true },
        where: { id: data.eventId }
      }),
      prisma.endpoint.findMany({
        where: {
          applicationId: data.applicationId,
          isActive: true,
          eventTypes: { has: data.eventType }
        },
        select: {
          id: true,
          url: true,
          method: true,
          headers: true,
          secret: true
        }
      })
    ]);

    if (!event) {
      console.error(`event ${data.eventId} not found`);
      return;
    }

    if (!endpoints.length) {
      console.warn(`event ${data.eventId} has no endpoints`);
      return;
    }

    await Promise.all(
      endpoints.map(endpoint =>
        limit(() =>
          prisma.eventAttempt.upsert({
            where: {
              idempotencyKey: `initial:${endpoint.id}:${data.eventId}`
            },
            update: {},
            create: {
              eventId: data.eventId,
              endpointId: endpoint.id,
              status: 'WAITING',
              idempotencyKey: `initial:${endpoint.id}:${data.eventId}`
            }
          })
        )
      )
    );

    const attempts = await prisma.eventAttempt.findMany({
      where: {
        eventId: data.eventId,
        status: 'WAITING'
      },
      select: {
        id: true,
        endpoint: {
          select: {
            url: true,
            method: true,
            headers: true,
            secret: true
          }
        }
      }
    });

    await Promise.all(
      attempts.map(attempt =>
        limit(async () => {

          await dispatchToQueue({
            attemptId: attempt.id,
            eventId: data.eventId,
            url: attempt.endpoint.url,
            method: attempt.endpoint.method,
            headers: attempt.endpoint.headers,
            secret: attempt.endpoint.secret
          });

          await prisma.eventAttempt.updateMany({
            where: {
              id: attempt.id,
              status: 'WAITING' 
            },
            data: { status: 'ENQUEUED' }
          });
        })
      )
    );
  } catch (error) {
    console.error(`error processing event ${data.eventId}:`, error);

    const retryCount = webhookConsumer.getRetryCount(headers);

    if (retryCount < MAX_RETRIES) {
      const ttl = TTL_BASE * Math.pow(2, retryCount);

      await webhookProducer
        .insertToRetryQueue(data, 10, ttl)
        .catch(err => console.error('retry enqueue fail', err));
      return;
    }

    console.error('max retries reached, sending to DLQ');
    throw error;
  }
};

type WebhookDispatchJob = {
  eventId: string;
  attemptId: string;
  url: string;
  method: string;
  headers: Prisma.JsonValue;
  secret: string;
};

const dispatchToQueue = async (job: WebhookDispatchJob) => {
  console.log('dispatching job', job);


  // producer
};
