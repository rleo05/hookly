import { prisma } from '@hookly/database';
import { env } from '@hookly/env';
import { betterAuth, APIError } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { createAuthMiddleware } from 'better-auth/api';

export const auth = betterAuth({
    baseURL: env.server.APP_URL,
    database: prismaAdapter(prisma, { provider: 'postgresql' }),
    trustedOrigins: [env.server.FRONTEND_URL, 'http://localhost:5500'],
    basePath: '/auth',
    secret: env.auth.BETTER_AUTH_SECRET,
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        minPasswordLength: 8,
        maxPasswordLength: 128,
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
    hooks: {
        before: createAuthMiddleware(async (ctx) => {
            if (ctx.path !== "/sign-up/email") return;

            const { name } = ctx.body ?? {};

            const generatedAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

            return {
                context: {
                ...ctx,
                body: {
                    ...ctx.body,
                    image: generatedAvatarUrl,
                },
                },
            };
        }),
        after: createAuthMiddleware(async (ctx) => {
            if (ctx.path === '/sign-in/email') {
                const response = (ctx as unknown as { returned: Response }).returned;
                if (response && !response.ok) {
                    throw new APIError('UNAUTHORIZED', {
                        message: 'Invalid credentials',
                    });
                }
            }
        }),
    },

});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
