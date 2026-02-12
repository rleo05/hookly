import { ApiError } from '../../shared/errors.js';

export {
  createEndpointSchema,
  type CreateEndpoint,
  updateEndpointSchema,
  type UpdateEndpoint,
  endpointParamIdSchema,
  type EndpointParamId,
  listEndpointQuerySchema,
  type ListEndpointQuery,
  type EndpointItem,
  type EndpointList,
  type EndpointResponse,
} from '@hookly/api-types';

export class EndpointNotFound extends ApiError {
  constructor() {
    super(404, 'endpoint not found');
    this.name = 'EndpointNotFound';
  }
}
