import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Mail, Save } from 'lucide-react';
import { adminService } from '@/services/adminService';

interface AdminSettingsCardProps {
    initialEmail?: string;
    onSettingsUpdated?: (newEmail: string) => void;
}

export const AdminSettingsCard: React.FC<AdminSettingsCardProps> = ({
    initialEmail = '',
    onSettingsUpdated,
}) => {
    const [email, setEmail] = useState(initialEmail);
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    React.useEffect(() => {
        if (initialEmail) {
            setEmail(initialEmail);
        }
    }, [initialEmail]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        setSuccessMessage(null);
        setErrorMessage(null);

        try {
            const res = await adminService.updateSettings({ apae_email: email.trim() });
            setSuccessMessage(res.message || 'E-mail salvo com sucesso.');
            onSettingsUpdated?.(email.trim());
        } catch (err: any) {
            setErrorMessage(err.message || 'Não foi possível salvar o e-mail.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#4bb9a6]/15 dark:bg-[#112a2e] border border-[#4bb9a6]/25 dark:border-[#4bb9a6]/20 text-[#4bb9a6] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-app-navy dark:text-white">
                    E-mail de Destino dos Lotes
                </h3>
            </div>

            {successMessage && (
                <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl p-3 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}

            {errorMessage && (
                <div className="bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 rounded-xl p-3 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                <div>
                    <label
                        htmlFor="apae-email-input"
                        className="block text-xs font-bold text-app-navy dark:text-slate-200 mb-1.5"
                    >
                        E-mail institucional
                    </label>
                    <input
                        id="apae-email-input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contato@apaefranco.org.br"
                        required
                        className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-app-navy dark:text-white focus:outline-none focus:border-[#4bb9a6]"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-[#4bb9a6] hover:bg-[#3da392] disabled:opacity-60 text-white text-xs font-extrabold uppercase tracking-wider px-5 py-2.5 rounded-xl inline-flex items-center gap-2 shadow-md shadow-[#4bb9a6]/20 transition-all cursor-pointer"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
                </button>
            </form>
        </div>
    );
};
