import React from 'react';

export interface PasswordStrengthMeterProps {
    password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
    const isPasswordEmpty = !password;
    if (isPasswordEmpty) {
        return null;
    }

    const isTooShort = password.length < 6;
    if (isTooShort) {
        return (
            <div className="mt-2 px-1 flex items-center justify-between">
                <div className="flex gap-1.5 flex-1 max-w-[140px]">
                    <div className="h-1.5 rounded-full flex-1 transition-all bg-rose-500" />
                    <div className="h-1.5 rounded-full flex-1 transition-all bg-slate-200 dark:bg-slate-700" />
                    <div className="h-1.5 rounded-full flex-1 transition-all bg-slate-200 dark:bg-slate-700" />
                </div>
                <span className="text-[11px] font-semibold text-rose-500">Muito curta</span>
            </div>
        );
    }

    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);
    const varietyCount = [hasLetters, hasNumbers, hasSpecial].filter(Boolean).length;

    const isStrongPassword = password.length >= 8 && varietyCount >= 3;
    const isMediumPassword = password.length >= 6 && varietyCount >= 2;

    let score = 1;
    let label = 'Senha Fraca';
    let color = 'bg-rose-400';

    if (isStrongPassword) {
        score = 3;
        label = 'Senha Forte';
        color = 'bg-emerald-500';
    } else if (isMediumPassword) {
        score = 2;
        label = 'Senha Média';
        color = 'bg-amber-500';
    }

    return (
        <div className="mt-2 px-1 flex items-center justify-between">
            <div className="flex gap-1.5 flex-1 max-w-[140px]">
                <div
                    className={`h-1.5 rounded-full flex-1 transition-all ${
                        score >= 1 ? color : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                />
                <div
                    className={`h-1.5 rounded-full flex-1 transition-all ${
                        score >= 2 ? color : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                />
                <div
                    className={`h-1.5 rounded-full flex-1 transition-all ${
                        score >= 3 ? color : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                />
            </div>
            <span className="text-[11px] font-semibold text-app-graytext dark:text-gray-400">
                {label}
            </span>
        </div>
    );
};

export default PasswordStrengthMeter;
