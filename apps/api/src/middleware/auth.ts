import type { FastifyReply, FastifyRequest, preHandlerHookHandler } from 'fastify';
import { auth, type Session, type User } from '../lib/better-auth.js';

declare module 'fastify' {
  interface FastifyRequest {
    user: User | null;
    session: Session | null;
  }
}

export const authMiddleware: preHandlerHookHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const session = await auth.api.getSession({
    headers: request.headers as Record<string, string>,
  });

  if (!session) {
    return reply.status(401).send({ error: 'unauthorized' });
  }

  request.user = session.user;
  request.session = session.session;
};
