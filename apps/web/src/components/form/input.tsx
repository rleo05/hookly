import type { LucideIcon } from 'lucide-react';

interface InputProps {
  id: string;
  label?: string;
  type: string;
  placeholder?: string;
  icon?: LucideIcon;
  trailing?: React.ReactNode;
  autoComplete?: string;
  required?: boolean;
}

export function Input({
  id,
  label,
  type,
  placeholder,
  icon: Icon,
  trailing,
  autoComplete,
  required,
}: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-text-main" htmlFor={id}>
            {label}
          </label>
          {trailing}
        </div>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
        )}
        <input
          id={id}
          name={id}
          type={type}
          className="w-full bg-input border border-transparent focus:border-primary text-text-main text-sm rounded-xl h-12 pl-11 pr-4 outline-none transition-all duration-200 placeholder:text-text-muted/90"
          style={{ backgroundColor: 'var(--input)' }}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
        />
      </div>
    </div>
  );
}
