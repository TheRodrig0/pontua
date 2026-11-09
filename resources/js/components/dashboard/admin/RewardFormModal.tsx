import React from 'react';
import { AlertCircle, Loader2, Upload } from 'lucide-react';
import ModalDialog from '@/components/ui/ModalDialog';
import type { RewardItem, RewardTagValue } from '@/types/dashboard';

interface RewardFormModalProps {
    isOpen: boolean;
    editingReward: RewardItem | null;
    formName: string;
    formDescription: string;
    formTag: RewardTagValue;
    formCost: string;
    formHours: string;
    formImage: File | null;
    formError: string | null;
    isSaving: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onChangeName: (value: string) => void;
    onChangeDescription: (value: string) => void;
    onChangeTag: (value: RewardTagValue) => void;
    onChangeCost: (value: string) => void;
    onChangeHours: (value: string) => void;
    onChangeImage: (file: File | null) => void;
}

export const RewardFormModal: React.FC<RewardFormModalProps> = ({
    isOpen,
    editingReward,
    formName,
    formDescription,
    formTag,
    formCost,
    formHours,
    formImage,
    formError,
    isSaving,
    onClose,
    onSubmit,
    onChangeName,
    onChangeDescription,
    onChangeTag,
    onChangeCost,
    onChangeHours,
    onChangeImage,
}) => {
    const isEditing = Boolean(editingReward);
    const isAacc = formTag === 'aacc';

    return (
        <ModalDialog
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Editar Prêmio' : 'Cadastrar Novo Prêmio'}
            subtitle="Preencha os dados da recompensa que ficará disponível na loja."
        >
            <form onSubmit={onSubmit} className="space-y-4">
                {formError && (
                    <div className="bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 rounded-xl p-3.5 text-xs flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>{formError}</span>
                    </div>
                )}

                <div>
                    <label
                        htmlFor="admin-reward-name"
                        className="block text-xs font-bold text-app-navy dark:text-slate-200 mb-1.5"
                    >
                        Nome do Prêmio
                    </label>
                    <input
                        id="admin-reward-name"
                        type="text"
                        maxLength={50}
                        value={formName}
                        onChange={(e) => onChangeName(e.target.value)}
                        placeholder={
                            isAacc
                                ? 'Ex: Certificado de Horas Complementares'
                                : 'Ex: Camiseta Oficial GTI'
                        }
                        className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-app-navy dark:text-white focus:outline-none focus:border-[#4bb9a6]"
                        required
                    />
                </div>

                <div
                    className={`grid grid-cols-1 ${
                        isAacc ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
                    } gap-3.5`}
                >
                    <div>
                        <label
                            htmlFor="admin-reward-tag"
                            className="block text-xs font-bold text-app-navy dark:text-slate-200 mb-1.5"
                        >
                            Categoria
                        </label>
                        <select
                            id="admin-reward-tag"
                            value={formTag}
                            onChange={(e) => onChangeTag(e.target.value as RewardTagValue)}
                            className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-app-navy dark:text-white focus:outline-none focus:border-[#4bb9a6]"
                        >
                            <option value="clothing">Vestuário</option>
                            <option value="accessory">Acessório</option>
                            <option value="cosmetic">Cosmético</option>
                            <option value="aacc">Horas AACC</option>
                            <option value="other">Outros</option>
                        </select>
                    </div>

                    {isAacc && (
                        <div>
                            <label
                                htmlFor="admin-reward-hours"
                                className="block text-xs font-bold text-app-navy dark:text-slate-200 mb-1.5"
                            >
                                Quantidade de Horas (máx. 8h)
                            </label>
                            <input
                                id="admin-reward-hours"
                                type="number"
                                min={1}
                                max={8}
                                value={formHours}
                                onChange={(e) => onChangeHours(e.target.value)}
                                placeholder="1 a 8"
                                className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-app-navy dark:text-white focus:outline-none focus:border-[#4bb9a6] tabular-nums"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="admin-reward-cost"
                            className="block text-xs font-bold text-app-navy dark:text-slate-200 mb-1.5"
                        >
                            Custo em Pontos
                        </label>
                        <input
                            id="admin-reward-cost"
                            type="number"
                            min={1}
                            value={formCost}
                            onChange={(e) => onChangeCost(e.target.value)}
                            placeholder="Ex: 250"
                            className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-app-navy dark:text-white focus:outline-none focus:border-[#4bb9a6] tabular-nums"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="admin-reward-desc"
                        className="block text-xs font-bold text-app-navy dark:text-slate-200 mb-1.5"
                    >
                        Descrição (opcional)
                    </label>
                    <textarea
                        id="admin-reward-desc"
                        maxLength={200}
                        rows={2}
                        value={formDescription}
                        onChange={(e) => onChangeDescription(e.target.value)}
                        placeholder="Detalhes sobre retirada ou especificações..."
                        className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-app-navy dark:text-white focus:outline-none focus:border-[#4bb9a6]"
                    />
                </div>

                <div>
                    <label
                        htmlFor="admin-reward-image"
                        className="block text-xs font-bold text-app-navy dark:text-slate-200 mb-1.5"
                    >
                        Imagem (opcional, máx. 2MB)
                    </label>
                    <label
                        htmlFor="admin-reward-image"
                        className="flex items-center justify-center gap-2 w-full bg-slate-50 dark:bg-[#111827] border border-dashed border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-semibold text-app-graytext dark:text-slate-400 hover:border-[#4bb9a6] cursor-pointer transition-colors"
                    >
                        <Upload className="w-4 h-4 text-[#4bb9a6]" />
                        <span>
                            {formImage ? formImage.name : 'Selecionar imagem PNG, JPG ou WEBP'}
                        </span>
                        <input
                            id="admin-reward-image"
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={(e) => onChangeImage(e.target.files?.[0] || null)}
                            className="hidden"
                        />
                    </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-app-graytext dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-[#4bb9a6] hover:bg-[#3da392] disabled:opacity-60 text-white text-xs font-extrabold uppercase tracking-wider px-5 py-2.5 rounded-xl inline-flex items-center gap-2 shadow-md shadow-[#4bb9a6]/20 transition-all cursor-pointer"
                    >
                        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>{isSaving ? 'Salvando...' : 'Salvar Prêmio'}</span>
                    </button>
                </div>
            </form>
        </ModalDialog>
    );
};
