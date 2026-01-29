import type { ConfirmChannel } from 'amqplib';
import { rabbitService } from '../index.js';
import { QUEUES, webhookInsertPayloadSchema } from '../constants.js';
import type { InsertEventPayload } from '../constants.js';

type ConsumerHandler = (data: InsertEventPayload) => Promise<void>;

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
            async (content, _message) => {
                const parsed = webhookInsertPayloadSchema.safeParse(content);

                if (!parsed.success) {
                    console.error('invalid message format: ', parsed.error);
                    throw new Error('invalid message format'); 
                }

                try {
                    await handler(parsed.data);
                } catch (error) {
                    console.error('error processing webhook:', error);
                    throw error;
                }
            },
            { prefetch: 50 } 
        );
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