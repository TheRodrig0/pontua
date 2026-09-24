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
    if (!feedback) return null;

    return (
        <div
            className={`mb-4 p-3 rounded-2xl flex items-start gap-2.5 text-xs sm:text-sm font-medium transition-all ${
                feedback.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : feedback.type === 'error'
                    ? 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                    : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
            }`}
        >
            {feedback.type === 'success' && (
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            )}
            {feedback.type === 'error' && (
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600 dark:text-red-400" />
            )}
            {feedback.type === 'info' && (
                <Sparkles className="w-4 h-4 mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
            )}
            <div className="flex-1 leading-snug">{feedback.message}</div>
            <button
                type="button"
                onClick={onDismiss}
                aria-label="Fechar mensagem"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-0.5"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
};

export default FeedbackBanner;
