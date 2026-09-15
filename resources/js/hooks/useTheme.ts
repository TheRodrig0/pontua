import { useState } from 'react';

export function useTheme() {
    const [isDark, setIsDark] = useState(() => {
        const isClient = typeof window !== 'undefined';

        if (!isClient) {
            return false;
        }

        const hasDarkClass = document.documentElement.classList.contains('dark');

        return hasDarkClass;
    });

    const toggleTheme = () => {
        const isCurrentlyDark = document.documentElement.classList.contains('dark');
        const willBeDark = !isCurrentlyDark;

        if (willBeDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
            return;
        }

        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        setIsDark(false);
    };

    return {
        isDark,
        toggleTheme,
    };
}
