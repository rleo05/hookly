import cors from '@fastify/cors';
import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { env } from './config/env.js';
import { pingDatabase } from './lib/prisma.js';
import { apiKeyRoutes } from './modules/api-key/routes.js';
import applicationRoutes from './modules/application/routes.js';
import { authRoutes } from './modules/auth/routes.js';
import eventRoutes from './modules/event/routes.js';
import { userRoutes } from './modules/user/routes.js';
import apiKeyPlugin from './plugin/api-key.js';
import authPlugin from './plugin/auth.js';
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

fastify.register(authPlugin);
fastify.register(apiKeyPlugin);

fastify.register(authRoutes, { prefix: '/auth' });
fastify.register(userRoutes, { prefix: '/user' });
fastify.register(apiKeyRoutes, { prefix: '/api-key' });
fastify.register(applicationRoutes, { prefix: '/application' });
fastify.register(eventRoutes);

const start = async () => {
  try {
    await pingDatabase();
    await fastify.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
