import type { WebhookDispatchPayload } from '../constants.js';
import { QUEUES } from '../constants.js';
import { QueueBase } from '../base/queue-base.js';
import type { RabbitService } from '../service.js';

export class WebhookDispatchProducer extends QueueBase {
    protected readonly channelName = 'webhook dispatch producer';

    constructor(rabbitService: RabbitService) {
        super(rabbitService);
    }

    async dispatch(payload: WebhookDispatchPayload) {
        const channel = await this.getChannel();

        this.rabbitService.publish(QUEUES.WEBHOOK_DISPATCH.name, channel, payload);
    }

    async insertToRetryQueue(payload: WebhookDispatchPayload, priority: number, ttl: number) {
        const channel = await this.getChannel();

        if (!QUEUES.WEBHOOK_DISPATCH.retryQueue) {
            throw new Error('webhook dispatch retry queue not defined');
        }

        if (priority < 0 || priority > QUEUES.WEBHOOK_DISPATCH.options.maxPriority) {
            priority = QUEUES.WEBHOOK_DISPATCH.options.maxPriority;
        }

        this.rabbitService.publish(QUEUES.WEBHOOK_DISPATCH.retryQueue.name, channel, payload, { priority: priority, expiration: ttl });
    }
}
