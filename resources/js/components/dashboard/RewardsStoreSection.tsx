import React, { useState } from 'react';
import {
    Shirt,
    Sparkles,
    Gift,
    Watch,
    Plus,
    Pencil,
    Trash2,
    Upload,
    Loader2,
    AlertCircle,
    type LucideIcon,
} from 'lucide-react';
import ModalDialog from '@/components/ui/ModalDialog';
import { apiRequest } from '@/lib/api';
import type { RewardItem, RewardTagValue } from '@/types/dashboard';

interface RewardsStoreSectionProps {
    rewards: RewardItem[];
    currentBalance: number;
    isAdmin?: boolean;
    hasNextPage: boolean;
    isLoading: boolean;
    onLoadMore: () => void;
    onSelectReward: (rewardId: number) => void;
    onRewardsMutated?: () => void;
}

type StoreFilterTag = 'all' | RewardTagValue;

const TAG_CONFIG: Record<
    RewardTagValue,
    {
        label: string;
        coverBgClass: string;
        Icon: LucideIcon;
    }
> = {
    clothing: {
        label: 'Vestuário',
        coverBgClass: 'bg-gradient-to-br from-[#1e3a5f] to-[#1e293b]',
        Icon: Shirt,
    },
    accessory: {
        label: 'Acessório',
        coverBgClass: 'bg-gradient-to-br from-[#134e4a] to-[#0f3d3e]',
        Icon: Watch,
    },
    cosmetic: {
        label: 'Cosmético',
        coverBgClass: 'bg-gradient-to-br from-[#2e1f47] to-[#312e81]',
        Icon: Sparkles,
    },
    other: {
        label: 'Outros',
        coverBgClass: 'bg-gradient-to-br from-[#0f3d3e] to-[#134e4a]',
        Icon: Gift,
    },
};

export const RewardsStoreSection: React.FC<RewardsStoreSectionProps> = ({
    rewards,
    currentBalance,
    isAdmin = false,
    hasNextPage,
    isLoading,
    onLoadMore,
    onSelectReward,
    onRewardsMutated,
}) => {
    const [activeFilter, setActiveFilter] = useState<StoreFilterTag>('all');
    const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({});

    // Admin Form Modal State (POST /api/rewards & PATCH /api/rewards/{id})
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
    const [editingReward, setEditingReward] = useState<RewardItem | null>(null);
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formTag, setFormTag] = useState<RewardTagValue>('clothing');
    const [formCost, setFormCost] = useState('');
    const [formImage, setFormImage] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    const openCreateModal = () => {
        setEditingReward(null);
        setFormName('');
        setFormDescription('');
        setFormTag('clothing');
        setFormCost('');
        setFormImage(null);
        setFormError(null);
        setIsAdminModalOpen(true);
    };

    const openEditModal = (reward: RewardItem) => {
        setEditingReward(reward);
        setFormName(reward.name);
        setFormDescription(reward.description || '');
        setFormTag(reward.tag || 'other');
        setFormCost(String(reward.cost));
        setFormImage(null);
        setFormError(null);
        setIsAdminModalOpen(true);
    };

    const handleSaveReward = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormError(null);

        const parsedCost = parseInt(formCost, 10);
        if (!formName.trim() || Number.isNaN(parsedCost) || parsedCost < 1) {
            setFormError('Preencha o nome e um custo válido (mínimo 1 ponto).');
            return;
        }

        const formData = new FormData();
        formData.append('name', formName.trim());
        if (formDescription.trim()) {
            formData.append('description', formDescription.trim());
        }
        formData.append('tag', formTag);
        formData.append('cost', String(parsedCost));
        if (formImage) {
            formData.append('image', formImage);
        }

        setIsSaving(true);
        try {
            if (editingReward) {
                formData.append('_method', 'PATCH');
                await apiRequest<RewardItem>(`/api/rewards/${editingReward.id}`, {
                    method: 'POST',
                    body: formData,
                });
            } else {
                await apiRequest<RewardItem>('/api/rewards', {
                    method: 'POST',
                    body: formData,
                });
            }

            setIsAdminModalOpen(false);
            onRewardsMutated?.();
        } catch (error: any) {
            setFormError(
                error.message || 'Não foi possível salvar a recompensa.'
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteReward = async (id: number) => {
        setDeletingId(id);
        try {
            await apiRequest<{ message: string }>(`/api/rewards/${id}`, {
                method: 'DELETE',
            });
            onRewardsMutated?.();
        } catch {
            // Ignore if already deleted
        } finally {
            setDeletingId(null);
        }
    };

    const filteredRewards = rewards.filter((reward) => {
        if (activeFilter === 'all') {
            return true;
        }
        return reward.tag === activeFilter;
    });

    return (
        <div className="space-y-6">
            {/* Store Header Banner & Database Tag Filters */}
            <div className="bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg sm:text-xl font-extrabold text-app-navy dark:text-white tracking-tight">
                            Loja de Recompensas
                        </h2>
                        <span className="bg-app-navy dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                            SALDO: {currentBalance.toLocaleString('pt-BR')} PTS
                        </span>
                    </div>
                    <p className="text-xs text-app-graytext dark:text-slate-400 mt-1">
                        Recompensas disponíveis para resgate com seus pontos acumulados.
                    </p>
                </div>

                {/* Filter Buttons mapped strictly to RewardTag enum in DB + Admin Button */}
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveFilter('all')}
                        className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                            activeFilter === 'all'
                                ? 'bg-[#4bb9a6]/15 dark:bg-[#112a2e] text-[#4bb9a6] border border-[#4bb9a6]/30'
                                : 'text-app-graytext dark:text-slate-400 hover:text-app-navy dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        }`}
                    >
                        Todos
                    </button>

                    {(Object.keys(TAG_CONFIG) as RewardTagValue[]).map((tagKey) => {
                        const cfg = TAG_CONFIG[tagKey];
                        const Icon = cfg.Icon;
                        const isActive = activeFilter === tagKey;

                        return (
                            <button
                                key={tagKey}
                                type="button"
                                onClick={() => setActiveFilter(tagKey)}
                                className={`text-xs font-bold px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                                    isActive
                                        ? 'bg-[#4bb9a6]/15 dark:bg-[#112a2e] text-[#4bb9a6] border border-[#4bb9a6]/30'
                                        : 'text-app-graytext dark:text-slate-400 hover:text-app-navy dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5 text-[#4bb9a6]" />
                                <span>{cfg.label}</span>
                            </button>
                        );
                    })}

                    {isAdmin && (
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="bg-[#4bb9a6] hover:bg-[#3da392] text-white text-xs font-extrabold px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Nova Recompensa</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Rewards Grid */}
            {filteredRewards.length === 0 ? (
                <div className="bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-12 text-center">
                    <Gift className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
                    <p className="text-base font-extrabold text-app-navy dark:text-white">
                        Nenhuma recompensa encontrada
                    </p>
                    <p className="text-xs text-app-graytext dark:text-slate-400 mt-1">
                        Não há recompensas cadastradas no banco para este filtro.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredRewards.map((reward) => {
                        const tagConfig =
                            TAG_CONFIG[reward.tag] || TAG_CONFIG.other;
                        const CoverIcon = tagConfig.Icon;
                        const showImage =
                            Boolean(reward.url_image) && !brokenImages[reward.id];

                        return (
                            <div
                                key={reward.id}
                                className="bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl overflow-hidden flex flex-col shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                            >
                                {/* Cover: Real DB url_image if present, otherwise styled fallback */}
                                <div
                                    className={`relative h-44 sm:h-48 w-full ${tagConfig.coverBgClass} border-b border-white/10 flex items-center justify-center overflow-hidden`}
                                >
                                    {showImage ? (
                                        <img
                                            src={reward.url_image!}
                                            alt={reward.name}
                                            onError={() =>
                                                setBrokenImages((prev) => ({
                                                    ...prev,
                                                    [reward.id]: true,
                                                }))
                                            }
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="bg-white/10 border border-white/15 rounded-2xl p-4 flex items-center justify-center shadow-inner">
                                            <CoverIcon
                                                className="w-10 h-10 text-white"
                                                strokeWidth={1.75}
                                                aria-hidden="true"
                                            />
                                        </div>
                                    )}

                                    {/* Admin Actions on Card */}
                                    {isAdmin && (
                                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(reward)}
                                                aria-label={`Editar ${reward.name}`}
                                                className="bg-slate-900/85 hover:bg-slate-900 text-white p-2 rounded-lg border border-white/15 transition-colors cursor-pointer"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                disabled={deletingId === reward.id}
                                                onClick={() => handleDeleteReward(reward.id)}
                                                aria-label={`Excluir ${reward.name}`}
                                                className="bg-rose-600/90 hover:bg-rose-600 text-white p-2 rounded-lg border border-white/15 transition-colors cursor-pointer"
                                            >
                                                {deletingId === reward.id ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    {/* Bottom-right cost pill from DB (reward.cost) */}
                                    <span className="absolute bottom-3.5 right-3.5 bg-slate-950/90 text-[#4bb9a6] text-xs font-black uppercase px-3 py-1.5 rounded-lg border border-slate-700/80">
                                        {reward.cost} PTS
                                    </span>
                                </div>

                                {/* Card Body - strictly DB fields (name, tag, description, cost) */}
                                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="text-base sm:text-lg font-extrabold text-app-navy dark:text-white tracking-tight">
                                                {reward.name}
                                            </h3>
                                            <span className="bg-[#4bb9a6]/15 dark:bg-[#112a2e] text-[#4bb9a6] border border-[#4bb9a6]/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shrink-0">
                                                {tagConfig.label}
                                            </span>
                                        </div>

                                        {reward.description && (
                                            <p className="text-xs text-app-graytext dark:text-slate-400 mt-2 leading-relaxed">
                                                {reward.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-4">
                                        <div>
                                            <span className="block text-[10px] text-app-graytext dark:text-slate-400">
                                                Custo de resgate
                                            </span>
                                            <span className="text-sm font-extrabold text-[#4bb9a6]">
                                                {reward.cost}{' '}
                                                <span className="font-semibold text-xs">
                                                    pontos
                                                </span>
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => onSelectReward(reward.id)}
                                            className="bg-[#4bb9a6] hover:bg-[#3da392] text-white text-xs font-extrabold px-4 py-2.5 rounded-xl inline-flex items-center gap-2 shadow-md shadow-[#4bb9a6]/20 transition-all cursor-pointer"
                                        >
                                            <Gift className="w-4 h-4" />
                                            <span>Detalhes</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {hasNextPage && (
                <div className="text-center pt-2">
                    <button
                        type="button"
                        onClick={onLoadMore}
                        disabled={isLoading}
                        className="bg-white dark:bg-[#182234] hover:bg-slate-50 dark:hover:bg-slate-800 text-[#4bb9a6] border border-slate-200 dark:border-slate-700 text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                        {isLoading ? 'Carregando...' : 'Carregar mais recompensas'}
                    </button>
                </div>
            )}

            {/* Admin Create/Update Reward Modal (POST /api/rewards & PATCH /api/rewards/{id}) */}
            <ModalDialog
                isOpen={isAdminModalOpen}
                onClose={() => setIsAdminModalOpen(false)}
                title={editingReward ? 'Editar Recompensa' : 'Nova Recompensa'}
                subtitle="Gerencie os itens disponíveis na Loja de Recompensas."
            >
                <form onSubmit={handleSaveReward} className="space-y-4">
                    {formError && (
                        <div
                            role="alert"
                            className="bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 rounded-xl p-3 text-xs flex items-start gap-2"
                        >
                            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                            <span>{formError}</span>
                        </div>
                    )}

                    <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl p-3">
                        <label
                            htmlFor="reward-name"
                            className="block text-[10px] font-extrabold uppercase tracking-wider text-app-graytext dark:text-slate-400 mb-1"
                        >
                            Nome (máx. 50 caracteres)
                        </label>
                        <input
                            id="reward-name"
                            type="text"
                            maxLength={50}
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            className="w-full bg-transparent text-xs sm:text-sm font-semibold text-app-navy dark:text-white focus:outline-none"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl p-3">
                            <label
                                htmlFor="reward-tag"
                                className="block text-[10px] font-extrabold uppercase tracking-wider text-app-graytext dark:text-slate-400 mb-1"
                            >
                                Tag (RewardTag)
                            </label>
                            <select
                                id="reward-tag"
                                value={formTag}
                                onChange={(e) =>
                                    setFormTag(e.target.value as RewardTagValue)
                                }
                                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-app-navy dark:text-white focus:outline-none"
                            >
                                <option value="clothing" className="bg-white dark:bg-[#111827]">
                                    Vestuário (clothing)
                                </option>
                                <option value="accessory" className="bg-white dark:bg-[#111827]">
                                    Acessório (accessory)
                                </option>
                                <option value="cosmetic" className="bg-white dark:bg-[#111827]">
                                    Cosmético (cosmetic)
                                </option>
                                <option value="other" className="bg-white dark:bg-[#111827]">
                                    Outros (other)
                                </option>
                            </select>
                        </div>

                        <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl p-3">
                            <label
                                htmlFor="reward-cost"
                                className="block text-[10px] font-extrabold uppercase tracking-wider text-app-graytext dark:text-slate-400 mb-1"
                            >
                                Custo (Pontos)
                            </label>
                            <input
                                id="reward-cost"
                                type="number"
                                min={1}
                                value={formCost}
                                onChange={(e) => setFormCost(e.target.value)}
                                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-app-navy dark:text-white focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl p-3">
                        <label
                            htmlFor="reward-description"
                            className="block text-[10px] font-extrabold uppercase tracking-wider text-app-graytext dark:text-slate-400 mb-1"
                        >
                            Descrição (máx. 200 caracteres)
                        </label>
                        <textarea
                            id="reward-description"
                            maxLength={200}
                            rows={2}
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            className="w-full bg-transparent text-xs sm:text-sm font-medium text-app-navy dark:text-white focus:outline-none resize-none"
                        />
                    </div>

                    <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl p-3">
                        <label
                            htmlFor="reward-image"
                            className="block text-[10px] font-extrabold uppercase tracking-wider text-app-graytext dark:text-slate-400 mb-1.5"
                        >
                            Imagem (PNG, JPG, WEBP até 2MB)
                        </label>
                        <div className="flex items-center gap-2">
                            <Upload className="w-4 h-4 text-[#4bb9a6] shrink-0" />
                            <input
                                id="reward-image"
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={(e) =>
                                    setFormImage(e.target.files?.[0] || null)
                                }
                                className="w-full text-xs text-app-graytext dark:text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#4bb9a6]/15 file:text-[#4bb9a6] cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsAdminModalOpen(false)}
                            className="px-4 py-2.5 rounded-xl text-xs font-bold text-app-graytext dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-[#4bb9a6] hover:bg-[#3da392] disabled:opacity-60 text-white text-xs font-extrabold uppercase tracking-wider px-5 py-2.5 rounded-xl inline-flex items-center gap-2 cursor-pointer"
                        >
                            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                            <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
                        </button>
                    </div>
                </form>
            </ModalDialog>
        </div>
    );
};

export default RewardsStoreSection;
