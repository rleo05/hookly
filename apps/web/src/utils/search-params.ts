import { redirect } from 'next/navigation';
import { z } from 'zod';
import { PaginationResult } from '@hookly/api-types';

type PaginatedResponse<T> = {
    data: T[];
    pagination: PaginationResult;
};

type FetchFn<T> = (params: {
    search?: string;
    page: number;
    size: number;
}) => Promise<PaginatedResponse<T>>;

const searchParamsSchema = z.object({
    search: z.string().optional(),
    page: z.coerce.number().optional(),
    size: z.coerce.number().optional(),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

export async function resolvePaginatedRoute<T>({
    searchParams,
    pathname,
    fetchFn,
}: {
    searchParams: Promise<Record<string, unknown>>;
    pathname: string;
    fetchFn: FetchFn<T>;
}) {
    const resolvedParams = await searchParams;

    const { search, page, size } = searchParamsSchema.parse(resolvedParams);

    const safePage = page ? Math.max(1, page) : 1;
    const safeSize = size ? Math.min(Math.max(5, size), 100) : 10;

    const params = new URLSearchParams(
        Object.entries(resolvedParams)
            .filter(([, value]) => typeof value === 'string')
            .map(([key, value]) => [key, value as string]),
    );

    let shouldRedirect = false;

    if (page && page !== safePage) {
        params.set('page', String(safePage));
        shouldRedirect = true;
    }

    if (size && size !== safeSize) {
        params.set('size', String(safeSize));
        shouldRedirect = true;
    }

    if (shouldRedirect) {
        redirect(`${pathname}?${params.toString()}`);
    }

    const result = await fetchFn({
        search,
        page: safePage,
        size: safeSize,
    });

    const totalPages = result.pagination.totalPages;

    if (page && page > totalPages) {
        params.set('page', String(totalPages));
        redirect(`${pathname}?${params.toString()}`);
    }

    return {
        data: result.data,
        pagination: result.pagination,
        search,
    };
}