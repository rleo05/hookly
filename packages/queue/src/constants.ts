import type { Options } from 'amqplib';
import { z } from 'zod';

export interface QueueDefinition {
    name: string;
    dlq?: boolean;
    options?: Options.AssertQueue;
    retryQueue?: boolean;
}

export const QUEUES = {
    WEBHOOK_DISPATCH: {
        name: 'webhook.dispatch.queue',
        options: {
            durable: true,
            maxPriority: 10,
        },
        dlq: true,
        retryQueue: true,
    },
} as const satisfies Record<string, QueueDefinition>;

export type QueueName = keyof typeof QUEUES;

export const webhookInsertPayloadSchema = z.object({
  eventId: z.string(),
  applicationUid: z.string(),
  eventType: z.string(),
});

export type InsertEventPayload = z.infer<typeof webhookInsertPayloadSchema>;

