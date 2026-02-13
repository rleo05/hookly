import { auth } from '@hookly/auth';
import { env } from '@hookly/env';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: ['GET', 'POST'],
    url: '/*',
    async handler(request: FastifyRequest, reply: FastifyReply) {
      try {
        const url = new URL(request.url, `${env.server.APP_URL}`);

        const headers = new Headers();
        for (const [key, value] of Object.entries(request.headers)) {
          if (value) {
            headers.append(key, Array.isArray(value) ? value.join(', ') : value);
          }
        }

        const requestInit: RequestInit = {
          method: request.method,
          headers,
        };

        if (request.body) {
          requestInit.body = JSON.stringify(request.body);
        }

        const req = new Request(url.toString(), requestInit);

        const response = await auth.handler(req);

        if (response.status === 404) {
          return reply.callNotFound();
        }

        reply.status(response.status);
        for (const [key, value] of response.headers) {
          reply.header(key, value);
        }

        const body = await response.text();
        return reply.send(body);
      } catch (error) {
        fastify.log.error(`auth error: ${error}`);
        return reply.status(500).send({
          error: 'internal server error',
        });
      }
    },
  });
}
