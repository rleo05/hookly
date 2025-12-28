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
import { authRoutes } from './modules/auth/routes.js';
import authPlugin from './plugin/auth.js';
import apiKeyPlugin from './plugin/api-key.js';
import { userRoutes } from './modules/user/routes.js';

const fastify = Fastify({
  logger: true,
}).withTypeProvider<ZodTypeProvider>();

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

fastify.register(cors, {
  origin: true,
  credentials: true,
});

fastify.register(authPlugin);
fastify.register(apiKeyPlugin);

fastify.register(authRoutes, { prefix: '/auth' });
fastify.register(userRoutes, { prefix: '/user' });
fastify.register(apiKeyRoutes, { prefix: '/api-key' });

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
