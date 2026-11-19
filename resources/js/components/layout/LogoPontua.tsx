import React from 'react';
import logo from '../../../images/logo.svg';

export interface LogoPontuaProps extends React.HTMLAttributes<HTMLDivElement> {
    iconSize?: number | string;
    showText?: boolean;
    textClassName?: string;
}

export const PontuaLogoIcon: React.FC<{
    size?: number | string;
    className?: string;
    alt?: string;
}> = ({ size = 40, className = '', alt = 'Logo Pontua' }) => {
    return (
        <img
            src={logo}
            alt={alt}
            style={{ width: size, height: size }}
            className={`shrink-0 ${className}`}
        />
    );
};

const LogoPontua: React.FC<LogoPontuaProps> = ({
    className = '',
    iconSize = 40,
    showText = true,
    textClassName = 'text-xl sm:text-2xl font-extrabold tracking-tight text-app-navy dark:text-white',
    ...props
}) => {
    return (
        <div
            className={`inline-flex items-center gap-3 select-none ${className}`}
            {...props}
        >
            <PontuaLogoIcon size={iconSize} />

            {showText && (
                <span className={textClassName}>
                    Pontua<span className="text-app-coral">.</span>
                </span>
            )}
        </div>
    );
};

export default LogoPontua;
