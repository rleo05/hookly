import { Button } from '@/src/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog';

interface ConfirmModalProps {
  children?: React.ReactNode;
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
}

export function ConfirmModal({
  children,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  open,
  onClose,
}: ConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {description && description}
        <DialogFooter>
          <DialogClose asChild>
            <Button
              className="cursor-pointer border border-border text-text-main hover:bg-muted-bg"
              type="button"
              variant="ghost"
            >
              {cancelText || 'Cancel'}
            </Button>
          </DialogClose>
          <Button
            type="submit"
            variant="destructive"
            onClick={() => onConfirm()}
            className="font-medium cursor-pointer"
          >
            {confirmText || 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
