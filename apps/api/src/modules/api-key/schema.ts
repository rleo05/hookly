import { z } from 'zod';

export const apiKeyCreateSchema = z.object({
  name: z.string().min(3).max(100),
});

export const apiKeyDeleteSchema = z.object({
  id: z.string(),
});

export type ApiKeyCreateSchema = z.infer<typeof apiKeyCreateSchema>;
export type ApiKeyDeleteSchema = z.infer<typeof apiKeyDeleteSchema>;

export type CreateApiKeyParams = {
  name: string;
  userId: string;
};

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
  name: string;
  createdAt: Date;
};

export type ApiKeyListResponse = {
  keys: ApiKeyListItem[];
};

export class ApiKeyLimitError extends Error {
  constructor() {
    super('api key limit reached');
    this.name = 'ApiKeyLimitError';
  }
}
