import { KeysPanel } from '@/src/components/keys/keys-panel';
import { getApiKeys } from '@/src/services/api/keys';
import { resolvePaginatedRoute, SearchParams } from '@/src/utils/search-params';

export default async function KeysPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { data: keys, pagination, search } = await resolvePaginatedRoute({
    searchParams,
    pathname: '/keys',
    fetchFn: getApiKeys,
  });

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-text-main">API Keys</h1>
        <p className="text-text-muted mt-1">
          Manage your API keys to integrate with Hookly API.
        </p>
      </div>

      <KeysPanel keys={keys} pagination={pagination} search={search} />
    </>
  );
}
