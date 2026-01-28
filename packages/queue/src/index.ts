import { RabbitService } from './service.js';

export const rabbitService = new RabbitService();


export type { MessageHandler, ConsumerOptions, RabbitConfig } from './service.js';

export { QUEUES } from './constants.js';
export type { QueueDefinition, QueueName } from './constants.js';

export type { ConfirmChannel, ConsumeMessage, Options } from 'amqplib';
