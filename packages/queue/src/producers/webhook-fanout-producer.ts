import type { WebhookFanoutPayload } from '../constants.js';
import { QUEUES } from '../constants.js';
import { QueueBase } from '../base/queue-base.js';
import type { RabbitService } from '../service.js';

export class WebhookFanoutProducer extends QueueBase {
  protected readonly channelName = 'webhook fanout producer';

  constructor(rabbitService: RabbitService) {
    super(rabbitService);
  }

  async insertEvent(payload: WebhookFanoutPayload) {
    const channel = await this.getChannel();

    this.rabbitService.publish(QUEUES.WEBHOOK_FANOUT.name, channel, payload);
  }

  async insertToRetryQueue(payload: WebhookFanoutPayload, priority: number, ttl: number) {
    const channel = await this.getChannel();

    if (!QUEUES.WEBHOOK_FANOUT.retryQueue) {
      throw new Error('webhook fanout retry queue not defined');
    }

    if (priority < 0 || priority > QUEUES.WEBHOOK_FANOUT.options.maxPriority) {
      priority = QUEUES.WEBHOOK_FANOUT.options.maxPriority;
    }

    this.rabbitService.publish(QUEUES.WEBHOOK_FANOUT.retryQueue.name, channel, payload, { priority: priority, expiration: ttl });
  }
}