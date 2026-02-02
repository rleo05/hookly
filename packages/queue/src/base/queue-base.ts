import type { ConfirmChannel } from 'amqplib';
import type { RabbitService } from '../service.js';

export abstract class QueueBase {
    public channel: ConfirmChannel | null = null;
    protected isInitializing: Promise<ConfirmChannel> | null = null;
    protected abstract readonly channelName: string;
    protected rabbitService: RabbitService;

    constructor(rabbitService: RabbitService) {
        this.rabbitService = rabbitService;
    }

    protected async getChannel(): Promise<ConfirmChannel> {
        if (this.channel) return this.channel;

        if (!this.isInitializing) {
            this.isInitializing = this.rabbitService
                .createChannel()
                .then((chan) => {
                    this.channel = chan;

                    this.channel.on('error', (err: Error) => {
                        console.error(`${this.channelName} channel error`, err);
                        this.channel = null;
                        this.isInitializing = null;
                    });

                    return chan;
                })
                .catch((err) => {
                    console.error(`${this.channelName} channel initialization failed`, err);
                    this.isInitializing = null;
                    throw err;
                });
        }

        return this.isInitializing;
    }
}
