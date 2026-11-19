import React from 'react';
import { ArrowRight, type LucideIcon } from 'lucide-react';

export interface AuthSubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isSubmitting?: boolean;
    icon?: LucideIcon;
    children: React.ReactNode;
}

export const AuthSubmitButton: React.FC<AuthSubmitButtonProps> = ({
    isSubmitting = false,
    icon: IconComponent = ArrowRight,
    children,
    disabled = false,
    className = '',
    type = 'submit',
    ...rest
}) => {
    const isButtonDisabled = isSubmitting || disabled;

    return (
        <button
            type={type}
            disabled={isButtonDisabled}
            className={`w-full bg-app-teal hover:brightness-95 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all text-xs sm:text-sm uppercase tracking-wider cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2 ${className}`}
            {...rest}
        >
            {isSubmitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
                <>
                    <span>{children}</span>
                    {IconComponent && <IconComponent size={16} />}
                </>
            )}
        </button>
    );
};

export default AuthSubmitButton;
