import { z } from 'zod';
import type { PaginationResult } from './pagination.js';

export const createApplicationSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters long').max(100, 'Name must be at most 100 characters long'),
    externalId: z.string().min(1, 'External ID must be at least 1 character long').optional(),
});

export type CreateApplication = z.infer<typeof createApplicationSchema>;

export const applicationItemSchema = z.object({
    uid: z.string(),
    externalId: z
        .string()
        .min(1)
        .nullable()
        .transform((v) => v ?? undefined),
    name: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type ApplicationItem = z.infer<typeof applicationItemSchema>;

export type ApplicationList = {
    applications: ApplicationItem[];
    pagination: PaginationResult;
};

export const applicationParamUidSchema = z.object({
    uid: z.string().min(1),
});

export type ApplicationParamUid = z.infer<typeof applicationParamUidSchema>;

export const updateApplicationSchema = z.object({
    name: z.string().min(3).max(100).optional(),
    externalId: z.string().min(1).optional(),
});

export type UpdateApplication = z.infer<typeof updateApplicationSchema>;
