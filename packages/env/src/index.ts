import 'dotenv/config';
import { z } from 'zod';

const serverSchema = z.object({
    PORT: z.coerce.number().default(8080),
    APP_ENV: z.enum(['dev', 'test', 'prod']).default('dev'),
    APP_URL: z.string(),
    FRONTEND_URL: z.string(),
});

const databaseSchema = z.object({
    DATABASE_URL: z.string(),
});

const authSchema = z.object({
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    BETTER_AUTH_SECRET: z.string(),
    API_KEY_SECRET: z.string(),
});

const redisSchema = z.object({
    REDIS_URL: z.string(),
});

const rabbitmqSchema = z.object({
    RABBITMQ_URL: z.string(),
    RABBITMQ_USERNAME: z.string().default('root'),
    RABBITMQ_PASSWORD: z.string().default('root'),
});

export const env = {
    get server() { return serverSchema.parse(process.env); },
    get database() { return databaseSchema.parse(process.env); },
    get auth() { return authSchema.parse(process.env); },
    get redis() { return redisSchema.parse(process.env); },
    get rabbitmq() { return rabbitmqSchema.parse(process.env); },
};

export type Env = {
    server: z.infer<typeof serverSchema>;
    database: z.infer<typeof databaseSchema>;
    auth: z.infer<typeof authSchema>;
    redis: z.infer<typeof redisSchema>;
    rabbitmq: z.infer<typeof rabbitmqSchema>;
};
