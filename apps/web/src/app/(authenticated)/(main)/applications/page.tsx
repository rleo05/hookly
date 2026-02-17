import { z } from 'zod';
import { ApplicationsPanel } from '@/src/components/applications-panel';
import { getApplications } from '@/src/services/api/applications';
import { redirect } from 'next/navigation';

const searchParamsSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().optional(),
  size: z.coerce.number().optional(),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await searchParams;

  const { search, page, size } = searchParamsSchema.parse(resolvedParams);

  const safePage = page ? Math.max(1, page) : 1;
  const safeSize = size ? Math.min(Math.max(5, size), 100) : 10;

  const params = new URLSearchParams(
    Object.entries(resolvedParams)
      .filter(([,value]) => typeof value === "string")
      .map(([key, value]) => [key, value as string])
  );

  let shouldRedirect = false;

  if (page && page !== safePage) {
    params.set("page", String(safePage));
    shouldRedirect = true;
  }

  if (size && size !== safeSize) {
    params.set("size", String(safeSize));
    shouldRedirect = true;
  }

  if (shouldRedirect) {
    redirect(`/applications?${params.toString()}`);
  }

  const applications = await getApplications({ search, page: safePage, size: safeSize });

  const { pagination } = applications;

  const totalPages = pagination.totalPages;

  if (page && page > totalPages) {
    params.set('page', totalPages.toString());
    redirect(`/applications?${params.toString()}`);
  }

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-text-main">Applications</h1>
        <p className="text-text-muted mt-1">
          Select an application to manage its events and endpoints.
        </p>
      </div>

      <ApplicationsPanel search={search} applications={applications} />
    </>
  );
}
