import { rabbitService } from "../service.js";
import { ConfirmChannel } from "amqplib";
import { QUEUES } from "../constants.js";

type InsertEventPayload = {
    eventId: string;
    applicationUid: string;
    eventType: string;
}

class WebhookProducer {
    public channel: ConfirmChannel | null = null;
    private isInitializing: Promise<ConfirmChannel> | null = null;

    constructor() {}

    async init() {
        await this.getChannel();
    }

    private async getChannel() {
        if (this.channel) return this.channel;
        
        if(!this.isInitializing) {
            this.isInitializing = rabbitService.createChannel().then((chan) => {
                this.channel = chan;
                
                this.channel.on('error', (err: Error) => {
                    console.error('webhook producer channel error', err);
                    this.channel = null;
                    this.isInitializing = null;
                });

                return chan;
            }).catch(err => {
                console.error('webhook producer channel initialization failed', err);
                this.isInitializing = null;
                throw err;
            });
        }

        return this.isInitializing;
    }
    
    async insertEvent(payload: InsertEventPayload) {
        const channel = await this.getChannel();
       
        rabbitService.publish(
            QUEUES.WEBHOOK_DISPATCH.name,
            channel,
            payload,
        );
    }
}

export const webhookProducer = new WebhookProducer();