import { env } from '@hookly/env';
import { createClient, type RedisClientType, type SetOptions } from 'redis';

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

export async function safeGet(key: string) {
    if (!redis.isOpen) return null;

    try {
        return await redis.get(key);
    } catch (error) {
        console.error(`redis get for key ${key} failed`, error);
        return null;
    }
}

export async function safeSet(key: string, value: string, options?: SetOptions) {
    if (!redis.isOpen) return;

    try {
        await redis.set(key, value, options);
    } catch (error) {
        console.error(`redis set for key ${key} failed`, error);
    }
}

export type { RedisClientType } from 'redis';
