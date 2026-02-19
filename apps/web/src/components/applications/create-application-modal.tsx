'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { type CreateApplication, createApplicationSchema } from '@hookly/api-types';
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
import { createApplication } from '@/src/services/api/applications';

export function CreateApplicationModal({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateApplication>({
    resolver: zodResolver(createApplicationSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      externalId: '',
    },
  });

  async function onSubmit(data: CreateApplication) {
    const result = await createApplication({
      name: data.name,
      externalId: data.externalId || undefined,
    });

    if (result?.error) {
      if (result.error.includes('external id')) {
        setError('externalId', {
          message: result.error,
        });
        return;
      }

      toast.error(result.error);
      return;
    }

    toast.success('Application created successfully');
    reset();
    setOpen(false);
    router.refresh();
  }

  function handleOpenChange(value: boolean) {
    setOpen(value);

    if (!value) {
      reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Application</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-2">
          <Input
            id="name"
            label="Name"
            placeholder="My app"
            {...register('name', {
              setValueAs: (v) => v.trim(),
            })}
            disabled={isSubmitting}
            autoFocus
            autoComplete="off"
            error={errors.name?.message}
          />
          <Input
            id="externalId"
            label="External Id"
            placeholder="optional-external-id"
            {...register('externalId', {
              setValueAs: (v) => (v.trim() === '' ? undefined : v.trim()),
            })}
            disabled={isSubmitting}
            autoComplete="off"
            error={errors.externalId?.message}
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
      </DialogContent>
    </Dialog>
  );
}
