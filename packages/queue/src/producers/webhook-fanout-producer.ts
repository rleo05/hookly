import { rabbitService } from '../index.js';
import type { InsertEventPayload } from '../constants.js';
import type { ConfirmChannel } from 'amqplib';
import { QUEUES } from '../constants.js';

export class WebhookProducer {
  public channel: ConfirmChannel | null = null;
  private isInitializing: Promise<ConfirmChannel> | null = null;

  constructor() { }

  private async getChannel() {
    if (this.channel) return this.channel;

    if (!this.isInitializing) {
      this.isInitializing = rabbitService
        .createChannel()
        .then((chan) => {
          this.channel = chan;

          this.channel.on('error', (err: Error) => {
            console.error('webhook producer channel error', err);
            this.channel = null;
            this.isInitializing = null;
          });

          return chan;
        })
        .catch((err) => {
          console.error('webhook producer channel initialization failed', err);
          this.isInitializing = null;
          throw err;
        });
    }

    return this.isInitializing;
  }

  async insertEvent(payload: InsertEventPayload) {
    const channel = await this.getChannel();

    rabbitService.publish(QUEUES.WEBHOOK_FANOUT.name, channel, payload);
  }

  async insertToRetryQueue(payload: InsertEventPayload, priority: number, ttl: number) {
    const channel = await this.getChannel();

    if (!QUEUES.WEBHOOK_FANOUT.retryQueue) {
      throw new Error('webhook dispatch retry queue not defined');
    }

    if (priority < 0 || priority > QUEUES.WEBHOOK_FANOUT.options.maxPriority) {
      priority = QUEUES.WEBHOOK_FANOUT.options.maxPriority;
    }

    rabbitService.publish(QUEUES.WEBHOOK_FANOUT.retryQueue.name, channel, payload, { priority: priority, expiration: ttl });
  }
}