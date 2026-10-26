import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

export interface ModalDialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    maxWidthClass?: string;
}

export const ModalDialog: React.FC<ModalDialogProps> = ({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    maxWidthClass = 'max-w-lg',
}) => {
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const titleId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) {
            return;
        }

        if (isOpen && !dialog.open) {
            dialog.showModal();
        } else if (!isOpen && dialog.open) {
            dialog.close();
        }
    }, [isOpen]);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) {
            return;
        }

        const handleClose = () => {
            onClose();
        };

        dialog.addEventListener('close', handleClose);

        // Fallback for browsers without closedby support
        const supportsClosedBy =
            typeof HTMLDialogElement !== 'undefined' &&
            'closedBy' in HTMLDialogElement.prototype;

        const handleBackdropClick = (event: MouseEvent) => {
            if (event.target !== dialog) {
                return;
            }

            const rect = dialog.getBoundingClientRect();
            const isDialogContent =
                rect.top <= event.clientY &&
                event.clientY <= rect.top + rect.height &&
                rect.left <= event.clientX &&
                event.clientX <= rect.left + rect.width;

            if (isDialogContent) {
                return;
            }

            dialog.close();
        };

        if (!supportsClosedBy) {
            dialog.addEventListener('click', handleBackdropClick);
        }

        return () => {
            dialog.removeEventListener('close', handleClose);
            if (!supportsClosedBy) {
                dialog.removeEventListener('click', handleBackdropClick);
            }
        };
    }, [onClose]);

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            {...({ closedby: 'any' } as any)}
            className={`w-full ${maxWidthClass} m-auto rounded-2xl bg-white dark:bg-[#161f30] text-app-navy dark:text-gray-100 border border-slate-200 dark:border-slate-700/80 p-0 shadow-2xl backdrop:bg-slate-950/75 backdrop:backdrop-blur-xs open:animate-[fadeIn_0.2s_ease-out]`}
        >
            <div className="p-6">
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 mb-5">
                    <div>
                        <h2
                            id={titleId}
                            className="text-lg font-extrabold text-app-navy dark:text-white tracking-tight"
                        >
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="text-xs text-app-graytext dark:text-slate-400 mt-1 leading-relaxed">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => dialogRef.current?.close()}
                        aria-label="Fechar modal"
                        className="p-1.5 rounded-lg text-app-graytext dark:text-slate-400 hover:text-app-navy dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {children}
            </div>
        </dialog>
    );
};

export default ModalDialog;
