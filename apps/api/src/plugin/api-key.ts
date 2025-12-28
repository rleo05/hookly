import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import type { User } from '../lib/better-auth.js';
import { validate } from '../modules/api-key/service.js';

declare module 'fastify' {
  interface FastifyRequest {
    user: User | null;
  }

  interface FastifyInstance {
    authenticateApiKey: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export const apiKeyPlugin = fp(async (fastify: FastifyInstance) => {
  const apiKeyHook = async (request: FastifyRequest, reply: FastifyReply) => {
    const header = request.headers['x-api-key'];
    const apiKey = Array.isArray(header) ? header[0] : header;

    if (!apiKey) {
      return reply.code(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'missing api key',
      });
    }

    const user = await validate(apiKey);

    if (!user) {
      return reply.code(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'invalid api key',
      });
    }

    request.user = user;
  };

  fastify.decorate('authenticateApiKey', apiKeyHook);
});

export default apiKeyPlugin;
