import { z } from 'zod';
import type { PaginationResult } from './pagination.js';

export const apiKeyCreateSchema = z.object({
    name: z.string().trim().min(3, 'Name must be at least 3 characters long').max(100, 'Name must be at most 100 characters long'),
});

export const apiKeyDeleteSchema = z.object({
    id: z.cuid(),
});

export type ApiKeyCreate = z.infer<typeof apiKeyCreateSchema>;
export type ApiKeyDelete = z.infer<typeof apiKeyDeleteSchema>;

export type ApiKeyResponse = {
    key: {
        id: string;
        value: string;
        name: string;
        createdAt: Date;
    };
};

export type ApiKeyListItem = {
    id: string;
    keyId: string;
    name: string;
    createdAt: Date;
};

export type ApiKeyListResponse = {
    keys: ApiKeyListItem[];
    pagination: PaginationResult;
};
