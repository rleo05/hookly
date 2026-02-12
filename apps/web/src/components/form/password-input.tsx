import { Eye, EyeOff, type LucideIcon } from 'lucide-react';
import { useState } from 'react';

interface PasswordInputProps {
  id: string;
  label?: string;
  placeholder?: string;
  icon?: LucideIcon;
  trailing?: React.ReactNode;
}

export function PasswordInput({
  id,
  label,
  placeholder,
  icon: Icon,
  trailing,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
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
          type={showPassword ? 'text' : 'password'}
          className="w-full bg-input border border-transparent focus:border-primary text-text-main text-sm rounded-xl h-12 pl-11 pr-12 outline-none transition-all duration-200 placeholder:text-text-muted/90"
          placeholder={placeholder}
          autoComplete="current-password"
          required
        />
        <button
          className="absolute inset-y-0 right-0 text-text-muted border border-transparent rounded-xl px-2.5 flex items-center justify-center hover:bg-primary/10 hover:text-primary focus-visible:border-primary focus-visible:bg-primary/10 focus-visible:text-primary transition-all outline-none"
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
