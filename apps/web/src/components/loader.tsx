import { Loader2 } from 'lucide-react';

interface LoaderProps {
  text?: string;
  size?: number;
  className?: string;
  fullScreen?: boolean;
}

export function Loader({ text, size = 32, className = '', fullScreen = true }: LoaderProps) {
  const spinner = <Loader2 size={size} className={`animate-spin text-primary ${className}`} />;

  if (fullScreen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-3">
        {text && 
          <p className="text-text-main text-xl">{text}</p>
        }
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {text && <p className="text-text-main">{text}</p>}
      {spinner}
    </div>
  );
}
