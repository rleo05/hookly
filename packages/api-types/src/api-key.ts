import { z } from 'zod';
import type { PaginationResult } from './pagination.js';

export const apiKeyCreateSchema = z.object({
    name: z.string().min(3).max(100),
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
