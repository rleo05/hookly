'use client';

import type { ApplicationItem, PaginationResult } from '@hookly/api-types';
import { EllipsisVertical, Pencil, Plus, Search, SquareArrowOutUpRight, Trash } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table';
import { formatDate } from '@/src/utils/dates';
import { deleteApplication } from '../../services/api/applications';
import { ConfirmModal } from '../confirm-modal';
import { Input } from '../form/input';
import { PaginationControls } from '../pagination-controls';
import { CreateApplicationModal } from './create-application-modal';
import { EditApplicationModal } from './edit-application-modal';

interface ApplicationsPanelProps {
  applications: ApplicationItem[];
  pagination: PaginationResult;
  search?: string;
}

export function ApplicationsPanel({ applications: applicationList, pagination, search }: ApplicationsPanelProps) {

  const router = useRouter();
  const searchParams = useSearchParams();

  const inputRef = useRef<HTMLInputElement>(null);

  if (!search && inputRef.current) {
    inputRef.current.value = '';
  }

  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [editingApp, setEditingApp] = useState<ApplicationItem | null>(null);

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

  const handleDelete = async () => {
    if (!selectedUid) return;

    const result = await deleteApplication(selectedUid);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success('Application deleted successfully');
    setConfirmModalOpen(false);
    router.refresh();
  };

  return (
    <div className="@container">
      <div className="flex flex-col @[570px]:flex-row justify-between items-stretch @[570px]:items-center mt-10 @[570px]:mt-6 gap-4">
        <Input
          id="search"
          ref={inputRef}
          placeholder="Search by uid, external id or name"
          className="w-full @[570px]:min-w-84 @[570px]:w-auto px-4 pl-11 py-1.5 rounded-lg bg-muted-bg border border-border focus:outline-none"
          icon={Search}
          defaultValue={search}
          onChange={(e) => handleSearch(e.target.value)}
        />

        <div className="flex items-center gap-4 w-full @[570px]:w-auto">
          <CreateApplicationModal>
            <button className="w-full @[570px]:w-auto bg-primary text-primary-foreground font-semibold px-5 py-2 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors hover:bg-primary-hover">
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
        <div className="mt-6 min-w-0 w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Uid</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>External Id</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applicationList.map((application) => (
                <TableRow key={application.uid}>
                  <TableCell>{application.uid}</TableCell>
                  <TableCell
                    title={application.name.length >= 26 ? application.name : undefined}
                    className="max-w-[25ch] truncate"
                  >
                    {application.name}
                  </TableCell>
                  <TableCell
                    title={
                      (application.externalId?.length ?? 0) >= 26
                        ? application.externalId
                        : undefined
                    }
                    className="max-w-[25ch] truncate"
                  >
                    {application.externalId}
                  </TableCell>
                  <TableCell className='tabular-nums'>{formatDate(new Date(application.createdAt))}</TableCell>
                  <TableCell className='tabular-nums'>{formatDate(new Date(application.updatedAt))}</TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-center">
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
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onSelect={() => setEditingApp(application)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 cursor-pointer"
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
          onClose={() => {
            setConfirmModalOpen(false);
          }}
          title="Delete Application"
          description={
            <div className="flex flex-col gap-2 mb-12">
              <p>
                Are you sure you want to delete <strong>{selectedUid}</strong>?{' '}
              </p>
              <p>This action is irreversible.</p>
            </div>
          }
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDelete}
        ></ConfirmModal>
      )}

      {editingApp && (
        <EditApplicationModal
          application={editingApp}
          open={!!editingApp}
          onOpenChange={(open) => !open && setEditingApp(null)}
        />
      )}
    </div>
  );
}
