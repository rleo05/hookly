import amqp, {
    type ConsumeMessage,
    type ChannelModel,
    type ConfirmChannel,
    type Options,
} from 'amqplib';
import { QUEUES } from './constants.js';

const RECONNECT_MAX_ATTEMPTS = 5;

export type MessageHandler = (content: unknown, message: ConsumeMessage) => Promise<void> | void;

export type ConsumerOptions = Options.Consume & {
    prefetch?: number;
};

export type RabbitConfig = {
    url: string;
};

export class RabbitService {
    private connection: ChannelModel | null = null;
    private retryCount = 0;
    private isShuttingDown = false;
    private config: RabbitConfig | null = null;

    constructor() { }

    async init(config: RabbitConfig): Promise<void> {
        this.config = config;
        console.log('rabbitmq client connecting...');
        await this.connect();
        await this.createQueues();
    }

    async createQueues(): Promise<void> {
        if (!this.connection) {
            throw new Error('rabbitmq connection not initialized');
        }

        const channel = await this.connection.createChannel();

        for (const queue of Object.values(QUEUES)) {
            let finalOptions: Options.AssertQueue = { ...queue.options };

            if (queue.dlq) {
                const dlqName = `${queue.name}_dlq`;
                await channel.assertQueue(dlqName, { durable: true });
                finalOptions = {
                    ...finalOptions,
                    arguments: {
                        'x-dead-letter-exchange': '',
                        'x-dead-letter-routing-key': dlqName,
                    },
                };
            }

            await channel.assertQueue(queue.name, finalOptions);
        }
        await channel.close();
    }

    private async connect(): Promise<void> {
        if (!this.config) {
            throw new Error('rabbitmq client not initialized. Call init() first.');
        }

        this.connection = await amqp.connect(this.config.url);
        const channel = await this.connection.createChannel();
        try {
            console.log('rabbitmq client connected');
            this.retryCount = 0;

            this.connection.on('error', (err: Error) => {
                console.error('rabbitmq connection error', err);
            });

            this.connection.on('close', async () => {
                if (!this.isShuttingDown) {
                    console.warn('rabbitmq connection closed, attempting to reconnect...');
                    await this.reconnect();
                }
            });
        } catch (err) {
            console.error('rabbitmq connection failed', err);
            await this.reconnect();
        } finally {
            await channel.close();
        }
    }

    private async reconnect(): Promise<void> {
        if (this.isShuttingDown) return;

        if (this.retryCount >= RECONNECT_MAX_ATTEMPTS) {
            throw new Error(`rabbitmq connection failed after ${RECONNECT_MAX_ATTEMPTS} retries`);
        }

        this.retryCount++;
        const delay = Math.min(this.retryCount * 500, 3000);
        console.log(
            `rabbitmq reconnecting in ${delay}ms (attempt ${this.retryCount}/${RECONNECT_MAX_ATTEMPTS})`
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
        await this.connect();
    }

    publish(
        queue: string,
        channel: ConfirmChannel,
        message: Record<string, unknown>,
        options?: Options.Publish
    ): void {
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
            persistent: options?.persistent ?? true,
            contentType: 'application/json',
        });

        channel.waitForConfirms();
    }

    async consume(
        queue: string,
        channel: ConfirmChannel,
        handler: MessageHandler,
        options?: ConsumerOptions
    ): Promise<string> {
        await channel.prefetch(options?.prefetch || 10);

        const { consumerTag } = await channel.consume(
            queue,
            async (msg: ConsumeMessage | null) => {
                if (!msg) return;

                try {
                    const content = JSON.parse(msg.content.toString());

                    await handler(content, msg);

                    if (!options?.noAck) {
                        channel.ack(msg);
                    }
                } catch (err) {
                    console.error('rabbitmq message handler error', err);
                    if (!options?.noAck) {
                        channel.nack(msg, false, false);
                    }
                }
            },
            { noAck: options?.noAck ?? false }
        );
        return consumerTag;
    }

    async shutdown(): Promise<void> {
        this.isShuttingDown = true;

        if (this.connection) {
            await this.connection.close();
            this.connection = null;
        }

        console.log('rabbitmq client disconnected');
    }

    isConnected(): boolean {
        return this.connection !== null;
    }

    async createChannel(): Promise<ConfirmChannel> {
        if (!this.connection) {
            throw new Error('rabbitmq connection not initialized');
        }
        return this.connection.createConfirmChannel();
    }
}