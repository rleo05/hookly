'use client';

import type { ApiKeyListItem, PaginationResult } from '@hookly/api-types';
import { EllipsisVertical, Plus, Search, ShieldOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/src/utils/dates';
import { revokeApiKey } from '../../services/api/keys';
import { ConfirmModal } from '../confirm-modal';
import { Input } from '../form/input';
import { PaginationControls } from '../pagination-controls';
import { CreateKeyModal } from './create-key-modal';

interface KeysPanelProps {
  keys: ApiKeyListItem[];
  pagination: PaginationResult;
  search?: string;
}

export function KeysPanel({ keys: keyList, pagination, search }: KeysPanelProps) {

  const router = useRouter();
  const searchParams = useSearchParams();

  const inputRef = useRef<HTMLInputElement>(null);

  if (!search && inputRef.current) {
    inputRef.current.value = '';
  }

  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKeyListItem | null>(null);

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

  const handleRevoke = async () => {
    if (!selectedKey) return;

    const result = await revokeApiKey(selectedKey.id);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success('API key revoked successfully');
    setConfirmModalOpen(false);
    router.refresh();
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center mt-10 md:mt-6 gap-4">
        <Input
          id="search"
          ref={inputRef}
          placeholder="Search by name or key ID"
          className="w-full md:min-w-84 md:w-auto px-4 pl-11 py-1.5 md:py-2 rounded-lg bg-muted-bg border border-border focus:outline-none"
          icon={Search}
          defaultValue={search}
          onChange={(e) => handleSearch(e.target.value)}
        />

        <div className="flex items-center gap-4 w-full md:w-auto">
          <CreateKeyModal>
            <button className="w-full md:w-auto bg-primary text-primary-foreground font-semibold px-5 py-1.5 md:py-2 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors hover:bg-primary-hover">
              Create Key
              <Plus size={18} />
            </button>
          </CreateKeyModal>
        </div>
      </div>

      {!keyList.length ? (
        <div className="flex justify-center h-[300px] items-center">
          <p className="text-lg text-text-muted">No API keys found</p>
        </div>
      ) : (
        <div className="mt-6 min-w-0 w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key ID</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keyList.map((key) => (
                <TableRow key={key.id}>
                  <TableCell
                    title={key.name.length >= 26 ? key.name : undefined}
                    className="max-w-[25ch] truncate"
                  >
                    <span className="flex items-center gap-2">
                      {key.name}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-text-muted">{key.keyId}</TableCell>
                  <TableCell>{formatDate(new Date(key.createdAt))}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="outline-none">
                          <EllipsisVertical
                            size={18}
                            className="text-text-muted hover:text-primary transition-colors cursor-pointer"
                          />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 cursor-pointer"
                            onSelect={() => {
                              setSelectedKey(key);
                              setConfirmModalOpen(true);
                            }}
                          >
                            <ShieldOff className="mr-2 h-4 w-4" />
                            <span>Revoke</span>
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
          title="Revoke API Key"
          description={
            <div className="flex flex-col gap-2 mb-12">
              <p>
                Are you sure you want to revoke <strong>{selectedKey?.name}</strong>?{' '}
              </p>
              <p>This action is irreversible and will immediately invalidate the key.</p>
            </div>
          }
          confirmText="Revoke"
          cancelText="Cancel"
          onConfirm={handleRevoke}
        />
      )}
    </div>
  );
}
