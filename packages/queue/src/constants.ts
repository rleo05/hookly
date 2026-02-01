import type { Options } from 'amqplib';
import { z } from 'zod';

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
                messageTtl: 30000
            }
        },
    },
} as const satisfies Record<string, QueueDefinition>;

export type QueueName = keyof typeof QUEUES;

export const webhookInsertPayloadSchema = z.object({
    eventId: z.string(),
    applicationId: z.string(),
    eventType: z.string(),
});

export type InsertEventPayload = z.infer<typeof webhookInsertPayloadSchema>;

