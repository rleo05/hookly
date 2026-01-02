import { z } from 'zod';
import type { User } from '../lib/better-auth.js';

export const paginationResultSchema = z.object({
  page: z.number(),
  size: z.number(),
  total: z.number(),
  totalPages: z.number(),
});
export type PaginationResult = z.infer<typeof paginationResultSchema>;

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  size: z.coerce.number().min(1).max(100).default(10),
});

export type Pagination = z.infer<typeof paginationSchema>;
