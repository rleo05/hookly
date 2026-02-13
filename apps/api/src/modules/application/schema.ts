import { ApiError } from '../../shared/errors.js';

export {
  type ApplicationItem,
  type ApplicationList,
  type ApplicationParamUid,
  applicationItemSchema,
  applicationParamUidSchema,
  type CreateApplication,
  createApplicationSchema,
  type UpdateApplication,
  updateApplicationSchema,
} from '@hookly/api-types';

export class ApplicationExternalIdConflict extends ApiError {
  constructor() {
    super(409, 'application external id already in use');
    this.name = 'ApplicationExternalIdConflict';
  }
}

export class ApplicationNotFound extends ApiError {
  constructor() {
    super(404, 'application not found');
    this.name = 'ApplicationNotFound';
  }
}
