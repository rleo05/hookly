import { RabbitService } from './service.js';
import { WebhookFanoutProducer } from './producers/webhook-fanout-producer.js';
import { WebhookFanoutConsumer } from './consumers/webhook-fanout-consumer.js';
import { WebhookDispatchProducer } from './producers/webhook-dispatch-producer.js';
import { WebhookDispatchConsumer } from './consumers/webhook-dispatch-consumer.js';

export const rabbitService = new RabbitService();

export const webhookFanoutProducer = new WebhookFanoutProducer(rabbitService);
export const webhookFanoutConsumer = new WebhookFanoutConsumer(rabbitService);

export const webhookDispatchProducer = new WebhookDispatchProducer(rabbitService);
export const webhookDispatchConsumer = new WebhookDispatchConsumer(rabbitService);

export type MessagePropertyHeaders = import('amqplib').MessagePropertyHeaders;