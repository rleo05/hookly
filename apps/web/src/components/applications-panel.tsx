'use client';

import type { ApplicationList } from '@hookly/api-types';
import {
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  Plus,
  Search,
  SquareArrowOutUpRight,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/src/utils/dates';
import { Input } from '../components/form/input';
import { CreateApplicationModal } from './create-application-modal';

interface ApplicationsPanelProps {
  applications: ApplicationList;
  search?: string;
}

export function ApplicationsPanel({ applications, search }: ApplicationsPanelProps) {
  const { applications: applicationList, pagination } = applications;

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }

    router.replace(`?${params.toString()}`);
  }, 400);

  const { page, totalPages, size } = pagination;

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.replace(`?${params.toString()}`);
  };

  const handleSizeChange = (newSize: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('size', newSize);
    params.set('page', '1');
    router.replace(`?${params.toString()}`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mt-6">
        <Input
          id="search"
          placeholder="Search by uid, external id or name"
          className="p-2 min-w-84 px-4 pl-11 rounded-lg bg-muted-bg border border-border focus:outline-none"
          icon={Search}
          defaultValue={search}
          onChange={(e) => handleSearch(e.target.value)}
        />

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">Rows per page:</span>
            <div className="relative">
              <select
                value={size}
                onChange={(e) => handleSizeChange(e.target.value)}
                className="appearance-none bg-muted-bg border border-border text-text-main text-sm rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-muted">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          <CreateApplicationModal>
            <button className="bg-primary text-primary-foreground font-semibold px-5 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-colors hover:bg-primary-hover">
              Create Application
              <Plus size={18} />
            </button>
          </CreateApplicationModal>
        </div>
      </div>

      {!applicationList.length ? (
        <div className="flex justify-center h-[300px] items-center">
          <p className="text-lg text-text-muted">No applications found</p>
        </div>
      ) : (
        <div className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Uid</TableHead>
                <TableHead>External Id</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications?.applications.map((application) => (
                <TableRow key={application.uid}>
                  <TableCell>{application.uid}</TableCell>
                  <TableCell>{application.externalId}</TableCell>
                  <TableCell>{application.name}</TableCell>
                  <TableCell>{formatDate(new Date(application.createdAt))}</TableCell>
                  <TableCell>{formatDate(new Date(application.updatedAt))}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/applications/${application.uid}`}>
                        <SquareArrowOutUpRight
                          size={18}
                          className="text-text-muted hover:text-primary transition-colors cursor-pointer"
                        />
                      </Link>
                      <EllipsisVertical
                        size={18}
                        className="text-text-muted hover:text-primary transition-colors cursor-pointer"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="grid grid-cols-3 items-center mt-6">
            <div />
            <div className="flex justify-center">
              <span className="text-sm text-text-muted">
                Total: {pagination.total} applications
              </span>
            </div>
            <div className="flex items-center justify-end gap-4">
              <span className="text-sm text-text-muted">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="p-2 rounded-lg border border-border text-text-main disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted-bg transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="p-2 rounded-lg border border-border text-text-main disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted-bg transition-colors cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
