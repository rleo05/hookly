'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { type ApiKeyCreate, apiKeyCreateSchema } from '@hookly/api-types';
import { Check, Copy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/src/components/form/input';
import { createApiKey } from '@/src/services/api/keys';

export function CreateKeyModal({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApiKeyCreate>({
    resolver: zodResolver(apiKeyCreateSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
    },
  });

  async function onSubmit(data: ApiKeyCreate) {
    const result = await createApiKey({ name: data.name });

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.key) {
      setCreatedKey(result.key.value);
      router.refresh();
    }
  }

  async function handleCopy() {
    if (!createdKey) return;
    await navigator.clipboard.writeText(createdKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleClose() {
    setOpen(false);
    setCreatedKey(null);
    setCopied(false);
    reset();
  }

  function handleOpenChange(value: boolean) {
    if (!value) {
      handleClose();
    } else {
      setOpen(true);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {createdKey ? (
          <>
            <DialogHeader>
              <DialogTitle>API Key Created</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <p className="text-sm text-text-muted">
                Copy your API key now. You won&apos;t be able to see it again.
              </p>
              <div className="flex items-center gap-2 overflow-hidden" onClick={handleCopy}>
                <code className="flex-1 truncate rounded-lg bg-muted-bg border border-border px-3 py-2 text-sm font-mono text-text-main max-w-full">
                  {createdKey}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="shrink-0 p-2 rounded-lg border border-border bg-muted-bg hover:bg-border transition-colors cursor-pointer"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <Copy size={16} className="text-text-muted" />
                  )}
                </button>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-2">
              <Input
                id="name"
                label="Name"
                placeholder="My API Key"
                {...register('name', {
                  setValueAs: (v) => v.trim(),
                })}
                disabled={isSubmitting}
                autoFocus
                autoComplete="off"
                error={errors.name?.message}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    className="cursor-pointer border border-border text-text-main hover:bg-muted-bg"
                    type="button"
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
