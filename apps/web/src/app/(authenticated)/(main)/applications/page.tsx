import { z } from 'zod';
import { ApplicationsPanel } from '@/src/components/applications-panel';
import { getApplications } from '@/src/services/api/applications';

const searchParamsSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().min(1).optional(),
  size: z.coerce.number().min(1).max(100).optional(),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await searchParams;

  const { search, page, size } = searchParamsSchema.parse(resolvedParams);

  const applications = await getApplications({ search, page, size });

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-text-main">Applications</h1>
        <p className="text-text-muted mt-2">
          Select an application to manage its events and endpoints.
        </p>
      </div>

      <ApplicationsPanel search={search} applications={applications} />
    </>
  );
}
