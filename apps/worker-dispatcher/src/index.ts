import { pingDatabase, shutdownDatabase } from '@webhook-orchestrator/database';
import { env } from '@webhook-orchestrator/env';
import { rabbitService } from '@webhook-orchestrator/queue';

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

async function shutdown() {
    await Promise.all([
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
    } catch (err) {
        console.error('worker dispatcher failed to initialize', err);
        process.exit(1);
    }

    console.log('worker dispatcher initialized');

    const channel = await rabbitService.createChannel();

    // rabbitService.consume(QUEUES.WEBHOOK_DISPATCH.name, channel, async (content, _message) => {

    //     const parsed = webhookInsertPayloadSchema.safeParse(content);

    //     if (!parsed.success) {
    //         throw new Error('worker dispatcher received invalid message', parsed.error);
    //     }

    //     console.log('worker dispatcher received message', parsed.data);

    // }, { prefetch: 50 });
}
start();