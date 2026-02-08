import type { Options } from 'amqplib';
import { z } from 'zod';
import { Prisma } from '@hookly/database';

export interface QueueDefinition {
    name: string;
    dlq?: Dlq;
    options?: Options.AssertQueue;
    retryQueue?: RetryQueue;
}

type Dlq = {
    name: string;
    options?: Options.AssertQueue;
}

type RetryQueue = {
    name: string;
    options?: Options.AssertQueue;
}

export const QUEUES = {
    WEBHOOK_FANOUT: {
        name: 'webhook.fanout.queue',
        options: {
            durable: true,
            maxPriority: 10,
        },
        dlq: {
            name: 'webhook.fanout.dlq',
            options: {
                durable: true,
            }
        },
        retryQueue: {
            name: 'webhook.fanout.retry',
            options: {
                durable: true,
            }
        },
    },
    WEBHOOK_DISPATCH: {
        name: 'webhook.dispatch.queue',
        options: {
            durable: true,
            maxPriority: 10,
        },
        dlq: {
            name: 'webhook.dispatch.dlq',
            options: {
                durable: true,
            }
        },
        retryQueue: {
            name: 'webhook.dispatch.retry',
            options: {
                durable: true,
            }
        },
    },
} as const satisfies Record<string, QueueDefinition>;

export type QueueName = keyof typeof QUEUES;

export const webhookFanoutPayloadSchema = z.object({
    eventId: z.string(),
    eventUid: z.string(),
    applicationId: z.string(),
    eventType: z.string(),
});

export type WebhookFanoutPayload = z.infer<typeof webhookFanoutPayloadSchema>;

export const webhookDispatchPayloadSchema = z.object({
    eventId: z.string(),
    eventUid: z.string(),
    attemptId: z.string(),
    url: z.string(),
    method: z.string(),
    headers: z.custom<Prisma.JsonValue>().nullable().optional(),
    secret: z.string(),
});

export type WebhookDispatchPayload = z.infer<typeof webhookDispatchPayloadSchema>;
