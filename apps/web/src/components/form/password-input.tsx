import { useState } from "react";
import { LucideIcon, Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
    id: string;
    label?: string;
    placeholder?: string;
    icon?: LucideIcon;
    trailing?: React.ReactNode;
}

export function PasswordInput({ id, label, placeholder, icon: Icon, trailing }: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <div className="space-y-1.5">
            {label &&
                <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-text-main" htmlFor={id}>{label}</label>
                    {trailing}
                </div>
            }
            <div className="relative">
                {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />}
                <input
                    id={id}
                    name={id}
                    type={showPassword ? "text" : "password"}
                    className="w-full bg-input border border-transparent focus:border-primary text-text-main text-sm rounded-xl h-12 pl-11 pr-4 outline-none transition-all duration-200 placeholder:text-text-muted/90"
                    style={{ backgroundColor: 'var(--input)' }}
                    placeholder={placeholder}
                    autoComplete="current-password"
                    required
                />
                {showPassword ?
                    <EyeOff onClick={() => setShowPassword(false)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted cursor-pointer" size={18} /> :
                    <Eye onClick={() => setShowPassword(true)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted cursor-pointer" size={18} />}
            </div>
        </div>
    );
}