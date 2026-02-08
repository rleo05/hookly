import { initRedis, shutdownRedis } from '@hookly/cache';
import { pingDatabase, shutdownDatabase } from '@hookly/database';
import { env } from '@hookly/env';
import { rabbitService, webhookFanoutConsumer } from '@hookly/queue';
import { processWebhookMessage } from './service.js';

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

async function shutdown() {
  await Promise.allSettled([rabbitService.shutdown(), shutdownDatabase(), shutdownRedis()]);
  process.exit(0);
}

const start = async () => {
  console.log('webhook fanout worker initializing...');

  try {
    await pingDatabase();
    await rabbitService.init({ url: env.rabbitmq.RABBITMQ_URL });
  } catch (err) {
    console.error('webhook fanout worker failed to initialize', err);
    process.exit(1);
  }

  try {
    await initRedis();
  } catch (err) {
    console.error('redis failed to initialize', err);
  }

  await webhookFanoutConsumer.start(processWebhookMessage);
};
start();
