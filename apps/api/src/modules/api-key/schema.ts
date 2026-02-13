import { ApiError } from '../../shared/errors.js';

export {
  type ApiKeyCreate,
  type ApiKeyDelete,
  type ApiKeyListItem,
  type ApiKeyListResponse,
  type ApiKeyResponse,
  apiKeyCreateSchema,
  apiKeyDeleteSchema,
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
