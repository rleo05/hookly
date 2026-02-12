import { ApiError } from '../../shared/errors.js';

export {
  apiKeyCreateSchema,
  apiKeyDeleteSchema,
  type ApiKeyCreate,
  type ApiKeyDelete,
  type ApiKeyResponse,
  type ApiKeyListItem,
  type ApiKeyListResponse,
} from '@hookly/api-types';

export type CreateApiKeyParams = {
  name: string;
  userId: string;
};

export class ApiKeyLimitError extends ApiError {
  constructor() {
    super(403, 'api key limit reached');
    this.name = 'ApiKeyLimitError';
  }
}
