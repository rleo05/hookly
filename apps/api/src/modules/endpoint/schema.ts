import { z } from 'zod';
import { ApiError } from '../../shared/errors.js';
import type { PaginationResult } from '../../shared/schema.js';

export const createEndpointSchema = z.object({
  applicationUid: z.string().min(1),
  url: z.url().refine((url) => url.startsWith('https://'), 'url must be https'),
  description: z.string().optional(),
  eventTypes: z.array(z.string().min(1)).nullable().optional(),
  secret: z.string().min(3).optional(),
  isActive: z.boolean().optional(),
});

export type CreateEndpoint = z.infer<typeof createEndpointSchema>;

export const updateEndpointSchema = z.object({
  url: z
    .url()
    .refine((url) => url.startsWith('https://'), 'url must be https')
    .optional(),
  description: z.string().optional(),
  eventTypes: z.array(z.string().min(1)).nullable().optional(),
  secret: z.string().min(3).optional(),
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
  url: string;
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

export class EndpointNotFound extends ApiError {
  constructor() {
    super(404, 'endpoint not found');
    this.name = 'EndpointNotFound';
  }
}
