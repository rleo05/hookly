import Fastify from 'fastify';
import { env } from './config/env';
import { pingDatabase } from './lib/prisma';

const fastify = Fastify({
  logger: true,
});

fastify.get('/', async (_, reply) => {
  reply.send({ hello: 'world' });
});

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
