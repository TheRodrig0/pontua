import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export interface ThemeToggleProps {
    className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
    const { isDark, toggleTheme } = useTheme();
    const ThemeIcon = isDark ? Sun : Moon;

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className={`p-2 rounded-xl text-app-navy dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-app-teal-deep dark:focus-visible:outline-app-teal focus-visible:outline-offset-2 ${className}`}
            aria-label="Alternar tema"
        >
            <ThemeIcon size={20} />
        </button>
    );
};

export default ThemeToggle;