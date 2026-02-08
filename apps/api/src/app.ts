import cors from '@fastify/cors';
import { initRedis, shutdownRedis } from '@hookly/cache';
import { pingDatabase, shutdownDatabase } from '@hookly/database';
import { env } from '@hookly/env';
import { rabbitService } from '@hookly/queue';
import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { apiKeyRoutes } from './modules/api-key/routes.js';
import applicationRoutes from './modules/application/routes.js';
import { authRoutes } from './modules/auth/routes.js';
import endpointRoutes from './modules/endpoint/routes.js';
import eventRoutes from './modules/event/routes.js';
import { userRoutes } from './modules/user/routes.js';
import apiKeyPlugin from './plugin/api-key.js';
import authPlugin from './plugin/auth.js';
import idempotencyKeyPlugin from './plugin/idempotency-key.js';
import { globalErrorHandler } from './shared/errors.js';

const fastify = Fastify({
  logger: true,
}).withTypeProvider<ZodTypeProvider>();

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

fastify.register(cors, {
  origin: true,
  credentials: true,
});

fastify.setErrorHandler(globalErrorHandler);

fastify.addHook('onClose', async () => {
  await Promise.allSettled([shutdownRedis(), shutdownDatabase(), rabbitService.shutdown()]);
});

fastify.register(authPlugin);
fastify.register(apiKeyPlugin);
fastify.register(idempotencyKeyPlugin);

fastify.register(authRoutes, { prefix: '/auth' });
fastify.register(userRoutes, { prefix: '/user' });
fastify.register(apiKeyRoutes, { prefix: '/api-key' });
fastify.register(applicationRoutes, { prefix: '/application' });
fastify.register(endpointRoutes, { prefix: '/endpoint' });
fastify.register(eventRoutes);

const start = async () => {
  try {
    await pingDatabase();
    await initRedis();
    await rabbitService.init({ url: env.rabbitmq.RABBITMQ_URL });

    await fastify.listen({
      port: env.server.PORT,
      host: '0.0.0.0',
    });

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();

async function shutdown() {
  await fastify.close();
  process.exit(0);
}
