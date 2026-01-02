import { z } from 'zod';
import { ApiError } from '../../shared/errors.js';
import type { PaginationResult } from '../../shared/schema.js';

export const createApplicationSchema = z.object({
  name: z.string().min(3).max(100),
  externalId: z.string().optional(),
});

export type CreateApplication = z.infer<typeof createApplicationSchema>;

export type ApplicationItem = {
  uid: string;
  name: string;
  createdAt: Date;
};

export type ApplicationList = {
  applications: ApplicationItem[];
  pagination: PaginationResult;
};

export const applicationParamIdSchema = z.object({
  id: z.string().min(1),
});

export type ApplicationParamId = z.infer<typeof applicationParamIdSchema>;

export const updateApplicationSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  externalId: z.string().optional(),
});

export type UpdateApplication = z.infer<typeof updateApplicationSchema>;

export class ApplicationIDConflict extends ApiError {
  constructor() {
    super(409, 'application id already in use');
    this.name = 'ApplicationIDConflict';
  }
}

export class ApplicationNotFound extends ApiError {
  constructor() {
    super(404, 'application not found');
    this.name = 'ApplicationNotFound';
  }
}
