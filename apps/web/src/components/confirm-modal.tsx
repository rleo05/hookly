import { useRef, useState } from 'react';
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
  const [progress, setProgress] = useState(0);
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const DURATION = 1500;

  const animate = (time: number) => {
    if (!startTimeRef.current) startTimeRef.current = time;
    const runtime = time - startTimeRef.current;
    const newProgress = Math.min((runtime / DURATION) * 100, 100);

    setProgress(newProgress);

    if (newProgress < 100) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  const handleMouseEnter = () => {
    requestRef.current = requestAnimationFrame(animate);
  };

  const handleMouseLeave = () => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    startTimeRef.current = null;
    setProgress(0);
  };

  const handleConfirm = (e: React.MouseEvent) => {
    if (progress < 100) {
      e.preventDefault();
      return;
    }
    onConfirm();
  };

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
            onClick={handleConfirm}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleMouseEnter}
            onBlur={handleMouseLeave}
            className="cursor-pointer relative overflow-hidden transition-all font-medium"
            style={{
              background: `linear-gradient(to right, var(--primary) ${progress}%, var(--muted-bg) ${progress}%)`,
              color: progress >= 50 ? '#0a0a0aff' : 'var(--text-main)',
              borderColor: 'transparent',
            }}
          >
            <span className="relative z-10 pointer-events-none">{confirmText || 'Confirm'}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
