import { RabbitService } from './service.js';
import { WebhookProducer } from './producers/webhook-fanout-producer.js';
import { WebhookConsumer } from './consumers/webhook-fanout-consumer.js';

export const rabbitService = new RabbitService();
export const webhookProducer = new WebhookProducer();
export const webhookConsumer = new WebhookConsumer();

export type MessagePropertyHeaders = import('amqplib').MessagePropertyHeaders;