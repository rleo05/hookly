import { pingDatabase, shutdownDatabase } from '@webhook-orchestrator/database';
import { env } from '@webhook-orchestrator/env';
import { rabbitService } from '@webhook-orchestrator/queue';
import { webhookConsumer } from '@webhook-orchestrator/queue';
import { helloWorld } from './service.js';

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

async function shutdown() {
    await Promise.allSettled([
        rabbitService.shutdown(),
        shutdownDatabase(),
    ]);
    process.exit(0);
}

const start = async () => {
    console.log('worker dispatcher initializing...');

    try {
        await pingDatabase();
        await rabbitService.init({ url: env.rabbitmq.RABBITMQ_URL });
        await webhookConsumer.start(helloWorld);
    } catch (err) {
        console.error('worker dispatcher failed to initialize', err);
        process.exit(1);
    }
}
start();