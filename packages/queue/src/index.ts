import { RabbitService } from './service.js';
import { WebhookProducer } from './producers/webhook-producer.js';

export const rabbitService = new RabbitService();
export const webhookProducer = new WebhookProducer();
