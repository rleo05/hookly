import { z } from 'zod';
import type { PaginationResult } from './pagination.js';

export type JsonValue =
    | string
    | number
    | boolean
    | null
    | JsonValue[]
    | { [key: string]: JsonValue | undefined };

export const createEndpointSchema = z.object({
    applicationUid: z.string().min(1),
    description: z.string().trim().min(1, 'Description must be at least 1 character long').max(500, 'Description must be at most 500 characters long').optional(),
    eventTypes: z.array(z.string().min(1)).nullable().optional(),
    secret: z.string().trim().min(3, 'Secret must be at least 3 characters long').max(100, 'Secret must be at most 100 characters long').optional(),
    isActive: z.boolean().optional(),
    request: z.object({
        url: z.url({ error: 'url must be https', protocol: /^https$/ }),
        headers: z
            .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]))
            .optional(),
        method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD']).optional(),
    }),
});

export type CreateEndpoint = z.infer<typeof createEndpointSchema>;

export const updateEndpointSchema = z.object({
    request: z
        .object({
            url: z.url({ error: 'url must be https', protocol: /^https$/ }).optional(),
            headers: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]))
                .optional(),
            method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD']).optional(),
        })
        .optional(),
    description: z.string().trim().min(1, 'Description must be at least 1 character long').max(500, 'Description must be at most 500 characters long').optional(),
    eventTypes: z.array(z.string().min(1)).nullable().optional(),
    secret: z.string().trim().min(3, 'Secret must be at least 3 characters long').max(100, 'Secret must be at most 100 characters long').optional(),
    isActive: z.boolean().optional(),
});

export type UpdateEndpoint = z.infer<typeof updateEndpointSchema>;

export const endpointParamIdSchema = z.object({
    id: z.string().min(1),
});

export type EndpointParamId = z.infer<typeof endpointParamIdSchema>;

export const listEndpointQuerySchema = z.object({
    applicationUid: z.string().min(1),
    page: z.coerce.number().min(1).default(1),
    size: z.coerce.number().min(1).max(100).default(10),
});

export type ListEndpointQuery = z.infer<typeof listEndpointQuerySchema>;

export type EndpointItem = {
    uid: string;
    request: {
        url: string;
        method: string;
        headers?: JsonValue;
    };
    description: string | null;
    eventTypes: string[] | null;
    createdAt: Date;
    isActive: boolean;
};

export type EndpointList = {
    endpoints: EndpointItem[];
    pagination: PaginationResult;
};

export type EndpointResponse = EndpointItem & {
    secret: string;
};
