import { ApiError } from '../../shared/errors.js';

export {
  type CreateEndpoint,
  createEndpointSchema,
  type EndpointItem,
  type EndpointList,
  type EndpointParamId,
  type EndpointResponse,
  endpointParamIdSchema,
  type ListEndpointQuery,
  listEndpointQuerySchema,
  type UpdateEndpoint,
  updateEndpointSchema,
} from '@hookly/api-types';

export class EndpointNotFound extends ApiError {
  constructor() {
    super(404, 'endpoint not found');
    this.name = 'EndpointNotFound';
  }
}
