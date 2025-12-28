import { type FastifyReply, type FastifyRequest, type FastifyInstance } from 'fastify';
import { auth, type Session, type User } from '../lib/better-auth.js';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyRequest {
    user: User | null;
    session: Session | null;
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const authPlugin = fp(async (fastify: FastifyInstance) => {
  const authHook = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const session = await auth.api.getSession({
      headers: request.headers as Record<string, string>,
    });

    if (!session) {
      return reply.code(401).send({ 
        statusCode: 401, 
        error: 'Unauthorized', 
        message: 'invalid auth token' 
      });
    }

    request.user = session.user;
    request.session = session.session;
  };

  fastify.decorate('authenticate', authHook);
});

export default authPlugin;