import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3000),
  APP_ENV: z.enum(['dev', 'test', 'prod']).default('dev'),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  APP_URL: z.string(),
  FRONTEND_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  API_KEY_SECRET: z.string(),
  REDIS_URL: z.string(),
  RABBITMQ_URL: z.string(),
  RABBITMQ_USERNAME: z.string(),
  RABBITMQ_PASSWORD: z.string(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('invalid environment variables');
  process.exit(1);
}

export const env = _env.data;
