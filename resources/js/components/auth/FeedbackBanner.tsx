import React from 'react';
import { CheckCircle2, AlertCircle, Sparkles, X } from 'lucide-react';

export interface FeedbackState {
    type: 'success' | 'error' | 'info';
    message: string;
}

interface FeedbackBannerProps {
    feedback: FeedbackState | null;
    onDismiss: () => void;
}

export const FeedbackBanner: React.FC<FeedbackBannerProps> = ({ feedback, onDismiss }) => {
    const hasFeedback = Boolean(feedback);
    if (!hasFeedback) {
        return null;
    }

    const isSuccess = feedback?.type === 'success';
    const isError = feedback?.type === 'error';
    const isInfo = feedback?.type === 'info';

    return (
        <div
            className={`mb-4 p-3.5 rounded-xl flex items-start gap-2.5 text-xs sm:text-sm font-medium transition-all ${
                isSuccess
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                    : isError
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
                    : 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60'
            }`}
        >
            {isSuccess && (
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            )}
            {isError && (
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            {isInfo && (
                <Sparkles className="w-4 h-4 mt-0.5 shrink-0 text-app-teal" />
            )}
            <div className="flex-1 leading-snug">{feedback?.message}</div>
            <button
                type="button"
                onClick={onDismiss}
                aria-label="Fechar mensagem"
                className="text-app-graytext hover:text-app-navy dark:hover:text-gray-200 cursor-pointer p-0.5 transition-colors rounded"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
};

export default FeedbackBanner;
