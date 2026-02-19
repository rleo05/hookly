'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  type ApplicationItem,
  type UpdateApplication,
  updateApplicationSchema,
} from '@hookly/api-types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
} from '@/components/ui/dialog';
import { updateApplication } from '../../services/api/applications';
import { Input } from '../form/input';

interface EditApplicationModalProps {
  application: ApplicationItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditApplicationModal({
  application,
  open,
  onOpenChange,
}: EditApplicationModalProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UpdateApplication>({
    resolver: zodResolver(updateApplicationSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      externalId: '',
    },
  });

  useEffect(() => {
    if (application) {
      reset({
        name: application.name,
        externalId: application.externalId || '',
      });
    }
  }, [application, reset]);

  async function onSubmit(data: UpdateApplication) {
    if (!application) return;

    const result = await updateApplication(application.uid, {
      name: data.name,
      externalId: data.externalId || null,
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

    toast.success('Application updated successfully');
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Application</DialogTitle>
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
              setValueAs: (v) => (v.trim() === '' ? null : v.trim()),
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
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
