import { Loader2 } from 'lucide-react';

interface LoaderProps {
  size?: number;
  className?: string;
  fullScreen?: boolean;
}

export function Loader({ size = 32, className = '', fullScreen = true }: LoaderProps) {
  const spinner = <Loader2 size={size} className={`animate-spin text-primary ${className}`} />;

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">{spinner}</div>
    );
  }

  return <div className="flex items-center justify-center py-12">{spinner}</div>;
}
