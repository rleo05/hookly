import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3000),
  APP_ENV: z.enum(['dev', 'test', 'prod']).default('dev'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('invalid environment variables');
  process.exit(1);
}

export const env = _env.data;
