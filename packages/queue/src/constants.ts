import type { Options } from 'amqplib';

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
