'use client';

import type { ApplicationList } from '@hookly/api-types';
import {
  EllipsisVertical,
  Plus,
  Search,
  SquareArrowOutUpRight,
  Pencil,
  Trash,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate } from '@/src/utils/dates';
import { Input } from '../components/form/input';
import { PaginationControls } from './pagination-controls';
import { CreateApplicationModal } from './create-application-modal';
import { ConfirmModal } from './confirm-modal';
import { useState, useRef } from 'react';

interface ApplicationsPanelProps {
  applications: ApplicationList;
  search?: string;
}

export function ApplicationsPanel({ applications, search }: ApplicationsPanelProps) {
  const { applications: applicationList, pagination } = applications;

  const router = useRouter();
  const searchParams = useSearchParams();

  const inputRef = useRef<HTMLInputElement>(null);

  if (!search && inputRef.current) {
    inputRef.current.value = '';
  }

  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);

  const handleSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }

    router.replace(`?${params.toString()}`);
  }, 100);

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

  const handleDelete = (uid: string) => {
    
  };

  return (
    <div>
      <div className="flex justify-between items-center mt-6">
        <Input
          id="search"
          ref={inputRef}
          placeholder="Search by uid, external id or name"
          className="p-2 min-w-84 px-4 pl-11 rounded-lg bg-muted-bg border border-border focus:outline-none"
          icon={Search}
          defaultValue={search}
          onChange={(e) => handleSearch(e.target.value)}
        />

        <div className="flex items-center gap-4">
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
                      <DropdownMenu>
                        <DropdownMenuTrigger className="outline-none">
                          <EllipsisVertical
                            size={18}
                            className="text-text-muted hover:text-primary transition-colors cursor-pointer"
                          />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                            onSelect={() => {
                              setSelectedUid(application.uid);
                              setConfirmModalOpen(true);
                            }}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <PaginationControls
            currentPage={page}
            totalPages={totalPages}
            pageSize={size}
            totalItems={pagination.total}
            onPageChange={handlePageChange}
            onSizeChange={(value) => handleSizeChange(value)}
          />
        </div>
      )}
      {isConfirmModalOpen && (
        <ConfirmModal
          open={isConfirmModalOpen}
          onClose={() => { setConfirmModalOpen(false) }}
          title="Delete Application"
          description={
            <div className="flex flex-col gap-2">
              <p>Are you sure you want to delete <strong>{selectedUid}</strong>? </p>
              <p>This action is irreversible.</p>
            </div>
          }
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={() => {
            if (selectedUid) {
              console.log(selectedUid);
            }
          }}
        >
        </ConfirmModal>
      )}
    </div>
  );
}
