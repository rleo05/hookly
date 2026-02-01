import { env } from '@webhook-orchestrator/env';
import { createClient, type RedisClientType } from 'redis';

const MAX_RETRIES = 5;

export const redis: RedisClientType = createClient({
    url: env.redis.REDIS_URL,
    socket: {
        reconnectStrategy: (retries) => {
            if (retries >= MAX_RETRIES) {
                console.error(`redis connection failed after ${MAX_RETRIES} retries.`);
                return new Error(`redis connection failed after ${MAX_RETRIES} retries`);
            }

            return Math.min(retries * 500, 3000);
        },
    },
});

redis.on('error', (err) => console.error('redis client error', err));
redis.on('ready', () => console.log('redis client ready'));

export async function initRedis() {
    if (redis.isOpen) return;

    await redis.connect();
    await redis.ping();
}

export async function shutdownRedis() {
    if (redis.isOpen) {
        await redis.quit();
    }
}

export type { RedisClientType } from 'redis';
