import React, { useEffect, useState } from 'react';
import { Send, User, Sparkles, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import ModalDialog from '@/components/ui/ModalDialog';
import { apiRequest } from '@/lib/api';
import type { PointDonationItem, RankingUser } from '@/types/dashboard';

interface DonatePointsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentBalance: number;
    currentUserId?: number;
    rankingUsers: RankingUser[];
    initialRecipient?: { id: number; name: string } | null;
    onSuccess: (donation: PointDonationItem) => void;
}

export const DonatePointsModal: React.FC<DonatePointsModalProps> = ({
    isOpen,
    onClose,
    currentBalance,
    currentUserId,
    rankingUsers,
    initialRecipient,
    onSuccess,
}) => {
    const [recipientId, setRecipientId] = useState('');
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (initialRecipient) {
            setRecipientId(String(initialRecipient.id));
        } else {
            setRecipientId('');
        }
        setAmount('');
        setErrorMessage(null);
        setSuccessMessage(null);
    }, [initialRecipient, isOpen]);

    const eligibleRecipients = rankingUsers.filter((u) => u.id !== currentUserId);

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);

        const parsedRecipientId = parseInt(recipientId, 10);
        const parsedAmount = parseInt(amount, 10);

        if (!parsedRecipientId || Number.isNaN(parsedRecipientId)) {
            setErrorMessage('Informe o ID ou selecione um colega destinatário.');
            return;
        }
        if (parsedRecipientId === currentUserId) {
            setErrorMessage('Você não pode transferir pontos para sua própria conta.');
            return;
        }
        if (!parsedAmount || parsedAmount < 1) {
            setErrorMessage('Informe uma quantidade mínima de 1 ponto.');
            return;
        }
        if (parsedAmount > currentBalance) {
            setErrorMessage('Você não possui saldo suficiente para esta transferência.');
            return;
        }

        setIsSubmitting(true);
        try {
            const created = await apiRequest<PointDonationItem>('/api/donation', {
                method: 'POST',
                body: JSON.stringify({
                    recipient_id: parsedRecipientId,
                    amount: parsedAmount,
                }),
            });

            setSuccessMessage(`Transferência de ${parsedAmount} pts realizada com sucesso!`);
            setAmount('');
            onSuccess(created);
        } catch (error: any) {
            setErrorMessage(
                error.message || 'Falha ao transferir pontos. Verifique os dados informados.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ModalDialog
            isOpen={isOpen}
            onClose={onClose}
            title="Transferir Pontos para Colega"
            subtitle="Apoie outro estudante da FATEC transferindo parte do seu saldo de pontos."
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                    <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl p-3.5 text-xs flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                {successMessage && (
                    <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl p-3.5 text-xs flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{successMessage}</span>
                    </div>
                )}

                <div className="bg-[#4bb9a6]/10 dark:bg-[#112a2e]/50 border border-[#4bb9a6]/25 dark:border-[#4bb9a6]/20 rounded-xl p-3.5 flex items-center justify-between text-xs">
                    <span className="text-app-navy dark:text-slate-300">Saldo disponível para doação:</span>
                    <span className="font-extrabold text-[#4bb9a6]">
                        {currentBalance.toLocaleString('pt-BR')} PTS
                    </span>
                </div>

                {eligibleRecipients.length > 0 && (
                    <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5">
                        <label
                            htmlFor="donate-recipient-select"
                            className="block text-[10px] font-extrabold uppercase tracking-wider text-app-graytext dark:text-slate-400 mb-1.5"
                        >
                            Selecionar Colega do Ranking
                        </label>
                        <select
                            id="donate-recipient-select"
                            value={recipientId}
                            onChange={(e) => setRecipientId(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-[#111827] text-xs sm:text-sm font-semibold text-app-navy dark:text-white focus:outline-none"
                        >
                            <option value="">Escolha um aluno ou digite o ID abaixo...</option>
                            {eligibleRecipients.map((u) => (
                                <option key={u.id} value={u.id}>
                                    #{u.position} - {u.name} {u.nick ? `(@${u.nick})` : `(ID #${u.id})`}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 focus-within:border-[#4bb9a6]">
                        <label
                            htmlFor="donate-recipient-id"
                            className="block text-[10px] font-extrabold uppercase tracking-wider text-app-graytext dark:text-slate-400 mb-1.5"
                        >
                            ID do Destinatário
                        </label>
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-app-graytext dark:text-slate-400 shrink-0" />
                            <input
                                id="donate-recipient-id"
                                type="number"
                                min={1}
                                value={recipientId}
                                onChange={(e) => setRecipientId(e.target.value)}
                                placeholder="Ex: 2"
                                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-app-navy dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 focus-within:border-[#4bb9a6]">
                        <label
                            htmlFor="donate-amount"
                            className="block text-[10px] font-extrabold uppercase tracking-wider text-app-graytext dark:text-slate-400 mb-1.5"
                        >
                            Quantidade de Pontos
                        </label>
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#4bb9a6] shrink-0" />
                            <input
                                id="donate-amount"
                                type="number"
                                min={1}
                                max={Math.max(1, currentBalance)}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Ex: 50"
                                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-app-navy dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-app-graytext dark:text-slate-300 hover:text-app-navy dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[#4bb9a6] hover:bg-[#3da392] disabled:opacity-60 text-white text-xs font-extrabold uppercase tracking-wider px-5 py-2.5 rounded-xl inline-flex items-center gap-2 shadow-md shadow-[#4bb9a6]/20 transition-all cursor-pointer"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                        <span>{isSubmitting ? 'Transferindo...' : 'Confirmar Doação'}</span>
                    </button>
                </div>
            </form>
        </ModalDialog>
    );
};

export default DonatePointsModal;
