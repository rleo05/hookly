import type { ConfirmChannel, MessagePropertyHeaders } from 'amqplib';
import { rabbitService } from '../index.js';
import { QUEUES, webhookInsertPayloadSchema } from '../constants.js';
import type { InsertEventPayload } from '../constants.js';

type ConsumerHandler = (data: InsertEventPayload, headers: MessagePropertyHeaders | undefined) => Promise<void>;

export class WebhookConsumer {
    public channel: ConfirmChannel | null = null;
    private isInitializing: Promise<ConfirmChannel> | null = null;

    constructor() {}

    async start(handler: ConsumerHandler) {
        const channel = await this.getChannel();

        console.log('webhook consumer started listening');

        await rabbitService.consume(
            QUEUES.WEBHOOK_DISPATCH.name,
            channel,
            async (content, _message, headers) => {
                const parsed = webhookInsertPayloadSchema.safeParse(content);

                if (!parsed.success) {
                    console.error('invalid message format: ', parsed.error);
                    throw new Error('invalid message format'); 
                }

                try {
                    await handler(parsed.data, headers);
                } catch (error) {
                    console.error('error processing webhook:', error);
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

    private async getChannel() {
        if (this.channel) return this.channel;

        if (!this.isInitializing) {
            this.isInitializing = rabbitService
                .createChannel()
                .then((chan) => {
                    this.channel = chan;

                    this.channel.on('error', (err: Error) => {
                        console.error('webhook consumer channel error', err);
                        this.channel = null;
                        this.isInitializing = null;
                    });

                    return chan;
                })
                .catch((err) => {
                    console.error('webhook consumer channel initialization failed', err);
                    this.isInitializing = null;
                    throw err;
                });
        }

        return this.isInitializing;
    }
}