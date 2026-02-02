import type { MessagePropertyHeaders } from 'amqplib';
import { QUEUES, webhookDispatchPayloadSchema } from '../constants.js';
import type { WebhookDispatchPayload } from '../constants.js';
import { QueueBase } from '../base/queue-base.js';
import type { RabbitService } from '../service.js';

type ConsumerHandler = (data: WebhookDispatchPayload, headers: MessagePropertyHeaders | undefined) => Promise<void>;

export class WebhookDispatchConsumer extends QueueBase {
    protected readonly channelName = 'webhook dispatch consumer';

    constructor(rabbitService: RabbitService) {
        super(rabbitService);
    }

    async start(handler: ConsumerHandler) {
        const channel = await this.getChannel();

        console.log('webhook dispatch consumer started listening');

        await this.rabbitService.consume(
            QUEUES.WEBHOOK_DISPATCH.name,
            channel,
            async (content, _message, headers) => {
                const parsed = webhookDispatchPayloadSchema.safeParse(content);

                if (!parsed.success) {
                    console.error('invalid dispatch message format: ', parsed.error);
                    throw new Error('invalid dispatch message format');
                }

                try {
                    await handler(parsed.data, headers);
                } catch (error) {
                    console.error('error processing webhook dispatch:', error);
                    throw error;
                }
            },
            { prefetch: 50 }
        );
    }

    getRetryCount(headers: MessagePropertyHeaders | undefined) {
        const deaths = headers?.['x-death']
        if (!deaths?.length) return 0

        const entry = deaths.find(d => d.queue === QUEUES.WEBHOOK_DISPATCH.name)
        return entry?.count ?? 0
    }
}
