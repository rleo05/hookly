import { prisma } from '@webhook-orchestrator/database';
import { env } from '@webhook-orchestrator/env';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  trustedOrigins: [env.server.FRONTEND_URL, 'http://localhost:5500'],
  basePath: '/auth',
  secret: env.auth.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: env.auth.GOOGLE_CLIENT_ID,
      clientSecret: env.auth.GOOGLE_CLIENT_SECRET,
    },
  },
  user: {
    modelName: 'User',
  },
  session: {
    modelName: 'Session',
  },
  account: {
    modelName: 'Account',
  },
  verification: {
    modelName: 'Verification',
  },
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
