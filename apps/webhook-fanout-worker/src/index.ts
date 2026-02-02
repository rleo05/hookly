import { pingDatabase, shutdownDatabase } from '@webhook-orchestrator/database';
import { env } from '@webhook-orchestrator/env';
import { rabbitService } from '@webhook-orchestrator/queue';
import { webhookFanoutConsumer } from '@webhook-orchestrator/queue';
import { initRedis, shutdownRedis } from '@webhook-orchestrator/cache';
import { processWebhookMessage } from './service.js';

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

async function shutdown() {
    await Promise.allSettled([
        rabbitService.shutdown(),
        shutdownDatabase(),
        shutdownRedis(),
    ]);
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
}
start();