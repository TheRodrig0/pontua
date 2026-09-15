import React from 'react';
import logo from '../../images/logo.svg';

export interface LogoPontuaProps extends React.HTMLAttributes<HTMLDivElement> {
    iconSize?: number | string;
    showText?: boolean;
    textClassName?: string;
}

export const PontuaLogoIcon: React.FC<{
    size?: number | string;
    className?: string;
    alt?: string;
}> = ({ size = 36, className = '', alt = 'Logo Pontua' }) => {
    return (
        <img
            src={logo}
            alt={alt}
            style={{ width: size, height: size }}
            className={`shrink-0 rounded-xl shadow-md shadow-app-teal/30 ${className}`}
        />
    );
};

const LogoPontua: React.FC<LogoPontuaProps> = ({
    className = '',
    iconSize = 36,
    showText = true,
    textClassName = 'text-lg sm:text-xl font-extrabold tracking-tight text-app-navy dark:text-white',
    ...props
}) => {
    return (
        <div
            className={`inline-flex items-center gap-2.5 select-none ${className}`}
            {...props}
        >
            <PontuaLogoIcon size={iconSize} />

            {showText && (
                <span className={textClassName}>
                    PONTUA<span className="text-app-coral">.</span>
                </span>
            )}
        </div>
    );
};

export default LogoPontua;
