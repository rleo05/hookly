import { ApplicationsPanel } from '@/src/components/applications/applications-panel';
import { getApplications } from '@/src/services/api/applications';
import { resolvePaginatedRoute, SearchParams } from '@/src/utils/search-params';

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { data: applications, pagination, search } = await resolvePaginatedRoute({
    searchParams,
    pathname: '/applications',
    fetchFn: getApplications,
  });

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-text-main">Applications</h1>
        <p className="text-text-muted mt-1">
          Select an application to manage its events and endpoints.
        </p>
      </div>

      <ApplicationsPanel search={search} applications={applications} pagination={pagination} />
    </>
  );
}
