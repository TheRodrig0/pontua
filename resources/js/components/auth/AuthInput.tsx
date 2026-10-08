import React, { useState } from 'react';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react';

export interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: LucideIcon;
    error?: string;
}

export const AuthInput: React.FC<AuthInputProps> = ({
    label,
    icon: Icon,
    error,
    type = 'text',
    className = '',
    id,
    ...rest
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === 'password';
    const inputType = isPasswordField ? (showPassword ? 'text' : 'password') : type;
    const hasError = Boolean(error);

    return (
        <div className="space-y-1">
            <div
                className={`bg-slate-100/80 dark:bg-slate-900/80 border rounded-xl px-4 py-2.5 sm:py-3 transition-all ${
                    hasError
                        ? 'border-rose-500 ring-2 ring-rose-500/20'
                        : 'border-slate-200 dark:border-slate-700/80 focus-within:border-app-teal focus-within:ring-2 focus-within:ring-app-teal/20'
                }`}
            >
                <label
                    htmlFor={id}
                    className="block text-[10px] sm:text-[11px] font-extrabold text-app-graytext dark:text-gray-400 uppercase tracking-wider mb-1"
                >
                    {label}
                </label>
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4 text-app-graytext dark:text-gray-500 shrink-0" />}
                    <input
                        id={id}
                        type={inputType}
                        className={`w-full bg-transparent border-none focus:outline-none text-app-navy dark:text-white font-semibold text-xs sm:text-sm placeholder-app-placeholder dark:placeholder-gray-500 ${className}`}
                        {...rest}
                    />
                    {isPasswordField && (
                        <button
                            type="button"
                            onClick={() => {
                                setShowPassword(!showPassword);
                            }}
                            aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                            className="p-1 text-gray-400 hover:text-app-navy dark:hover:text-gray-200 transition-colors cursor-pointer rounded-lg shrink-0"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    )}
                </div>
            </div>
            {hasError && (
                <p className="text-[11px] font-semibold text-rose-500 dark:text-rose-400 ml-1">
                    {error}
                </p>
            )}
        </div>
    );
};

export default AuthInput;
