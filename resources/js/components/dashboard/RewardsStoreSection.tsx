import React, { useEffect, useState } from 'react';
import {
    Shirt,
    Sparkles,
    Gift,
    Watch,
    GraduationCap,
    Plus,
    Pencil,
    Trash2,
    Loader2,
    Printer,
    Clock,
    CheckCircle2,
    XCircle,
    type LucideIcon,
} from 'lucide-react';
import { RewardFormModal } from '@/components/dashboard/admin/RewardFormModal';
import { REWARD_TAG_LABELS } from '@/enums/dashboard';
import { redemptionService, type MyRedemption } from '@/services/redemptionService';
import { rewardService } from '@/services/rewardService';
import type { RewardItem, RewardTagValue } from '@/types/dashboard';
import { formatDateShort } from '@/utils/formatters';
import { openAaccCertificatePrint } from '@/utils/printAaccCertificate';

interface RewardsStoreSectionProps {
    rewards: RewardItem[];
    currentBalance: number;
    userName?: string;
    userEmail?: string;
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
        label: REWARD_TAG_LABELS.clothing,
        coverBgClass: 'bg-gradient-to-br from-[#1e3a5f] to-[#1e293b]',
        Icon: Shirt,
    },
    accessory: {
        label: REWARD_TAG_LABELS.accessory,
        coverBgClass: 'bg-gradient-to-br from-[#134e4a] to-[#0f3d3e]',
        Icon: Watch,
    },
    cosmetic: {
        label: REWARD_TAG_LABELS.cosmetic,
        coverBgClass: 'bg-gradient-to-br from-[#2e1f47] to-[#312e81]',
        Icon: Sparkles,
    },
    aacc: {
        label: REWARD_TAG_LABELS.aacc,
        coverBgClass: 'bg-gradient-to-br from-[#0f3d3e] to-[#1e3a5f]',
        Icon: GraduationCap,
    },
    other: {
        label: REWARD_TAG_LABELS.other,
        coverBgClass: 'bg-gradient-to-br from-[#0f3d3e] to-[#134e4a]',
        Icon: Gift,
    },
};

export const RewardsStoreSection: React.FC<RewardsStoreSectionProps> = ({
    rewards,
    currentBalance,
    userName = 'Estudante FATEC',
    userEmail,
    isAdmin = false,
    hasNextPage,
    isLoading,
    onLoadMore,
    onSelectReward,
    onRewardsMutated,
}) => {
    const [viewMode, setViewMode] = useState<'catalog' | 'my_redemptions'>('catalog');
    const [myRedemptions, setMyRedemptions] = useState<MyRedemption[]>([]);
    const [isLoadingMyRedemptions, setIsLoadingMyRedemptions] = useState(false);
    const [activeFilter, setActiveFilter] = useState<StoreFilterTag>('all');
    const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({});

    const fetchMyRedemptions = async () => {
        setIsLoadingMyRedemptions(true);
        try {
            const res = await redemptionService.listMine();
            setMyRedemptions(res.data || []);
        } catch {
            // Ignore error
        } finally {
            setIsLoadingMyRedemptions(false);
        }
    };

    useEffect(() => {
        fetchMyRedemptions();
    }, []);

    // Admin Form Modal State (POST /api/rewards & PATCH /api/rewards/{id})
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
    const [editingReward, setEditingReward] = useState<RewardItem | null>(null);
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formTag, setFormTag] = useState<RewardTagValue>('clothing');
    const [formCost, setFormCost] = useState('');
    const [formHours, setFormHours] = useState('4');
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
        setFormHours('4');
        setFormImage(null);
        setFormError(null);
        setIsAdminModalOpen(true);
    };

    const openEditModal = (reward: RewardItem) => {
        setEditingReward(reward);
        const hoursMatch =
            reward.name.match(/\((\d+)\s*h(?:oras?)?\)/i) ||
            reward.name.match(/\b(\d+)\s*horas?\b/i);
        const extractedHours = hoursMatch ? hoursMatch[1] : '4';
        const cleanName =
            reward.tag === 'aacc'
                ? reward.name.replace(/\s*\(\d+\s*h(?:oras?)?\)\s*$/i, '').trim()
                : reward.name;

        setFormName(cleanName);
        setFormDescription(reward.description || '');
        setFormTag(reward.tag || 'other');
        setFormCost(String(reward.cost));
        setFormHours(extractedHours);
        setFormImage(null);
        setFormError(null);
        setIsAdminModalOpen(true);
    };

    const handleSaveReward = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormError(null);

        const parsedCost = parseInt(formCost, 10);
        const isFormInvalid = !formName.trim() || Number.isNaN(parsedCost) || parsedCost < 1;
        if (isFormInvalid) {
            setFormError('Preencha o nome e um custo válido (mínimo 1 ponto).');
            return;
        }

        let finalName = formName.trim();
        const formData = new FormData();

        if (formTag === 'aacc') {
            const parsedHours = parseInt(formHours, 10);
            if (Number.isNaN(parsedHours) || parsedHours < 1 || parsedHours > 8) {
                setFormError('Para Horas AACC, informe uma quantidade entre 1 e 8 horas.');
                return;
            }
            const cleanBaseName = finalName.replace(/\s*\(\d+\s*h(?:oras?)?\)\s*$/i, '').trim();
            const alreadyMentionsHours = new RegExp(`\\b${parsedHours}\\s*h(oras?)?\\b`, 'i').test(
                cleanBaseName
            );
            finalName = alreadyMentionsHours
                ? cleanBaseName
                : `${cleanBaseName} (${parsedHours}h)`;
            formData.append('aacc_hours', String(parsedHours));
        }

        formData.append('name', finalName);
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
                await rewardService.update(editingReward.id, formData);
            } else {
                await rewardService.store(formData);
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
            await rewardService.destroy(id);
            onRewardsMutated?.();
        } catch {
            // Ignore if already deleted
        } finally {
            setDeletingId(null);
        }
    };

    const filteredRewards = rewards.filter((reward) => {
        const isShowingAll = activeFilter === 'all';
        if (isShowingAll) {
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
                        Troque seus pontos acumulados por prêmios ou consulte seus certificados e resgates.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex bg-slate-100 dark:bg-[#111827] p-1 rounded-xl border border-slate-200/70 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setViewMode('catalog')}
                            className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                                viewMode === 'catalog'
                                    ? 'bg-white dark:bg-[#182234] text-app-navy dark:text-white shadow-xs'
                                    : 'text-app-graytext dark:text-slate-400 hover:text-app-navy dark:hover:text-white'
                            }`}
                        >
                            Catálogo de Prêmios
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setViewMode('my_redemptions');
                                fetchMyRedemptions();
                            }}
                            className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                                viewMode === 'my_redemptions'
                                    ? 'bg-white dark:bg-[#182234] text-[#4bb9a6] shadow-xs font-extrabold'
                                    : 'text-app-graytext dark:text-slate-400 hover:text-app-navy dark:hover:text-white'
                            }`}
                        >
                            <span>Meus Resgates</span>
                            {myRedemptions.length > 0 && (
                                <span className="bg-[#4bb9a6]/20 text-[#4bb9a6] text-[10px] font-black px-1.5 py-0.2 rounded-full">
                                    {myRedemptions.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {isAdmin && viewMode === 'catalog' && (
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

            {viewMode === 'catalog' ? (
                <>
                    {/* Category Filter Bar */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveFilter('all')}
                            className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                                activeFilter === 'all'
                                    ? 'bg-[#4bb9a6]/15 dark:bg-[#112a2e] text-[#4bb9a6] border border-[#4bb9a6]/30'
                                    : 'bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800 text-app-graytext dark:text-slate-400 hover:text-app-navy dark:hover:text-white'
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
                                            : 'bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800 text-app-graytext dark:text-slate-400 hover:text-app-navy dark:hover:text-white'
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5 text-[#4bb9a6]" />
                                    <span>{cfg.label}</span>
                                </button>
                            );
                        })}
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

                                    <span className="absolute bottom-3.5 right-3.5 bg-slate-950/90 text-[#4bb9a6] text-xs font-black uppercase px-3 py-1.5 rounded-lg border border-slate-700/80">
                                        {reward.cost} PTS
                                    </span>
                                </div>

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
                </>
            ) : (
                /* My Redemptions View inside Store */
                <div className="bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-4 mb-5">
                        <div>
                            <h3 className="text-base font-extrabold text-app-navy dark:text-white flex items-center gap-2">
                                <Gift className="w-4 h-4 text-[#4bb9a6]" />
                                <span>Meus Resgates &amp; Certificados</span>
                            </h3>
                            <p className="text-xs text-app-graytext dark:text-slate-400 mt-0.5">
                                Histórico de pedidos realizados na loja e comprovantes para emissão e download.
                            </p>
                        </div>
                    </div>

                    {isLoadingMyRedemptions ? (
                        <div className="py-12 flex items-center justify-center gap-2 text-xs text-app-graytext dark:text-slate-400">
                            <Loader2 className="w-5 h-5 animate-spin text-[#4bb9a6]" />
                            <span>Carregando seus pedidos...</span>
                        </div>
                    ) : myRedemptions.length === 0 ? (
                        <div className="py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                            <Gift className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                            <p className="text-xs font-bold text-app-navy dark:text-white">
                                Você ainda não resgatou nenhum prêmio
                            </p>
                            <p className="text-[11px] text-app-graytext dark:text-slate-400 mt-1">
                                Volte ao Catálogo e escolha uma recompensa com seus pontos.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {myRedemptions.map((item) => {
                                const isAacc = item.reward?.tag === 'aacc';
                                const isPending = item.status === 'pending';
                                const isCompleted = item.status === 'completed';
                                const isCancelled = item.status === 'cancelled';

                                return (
                                    <div
                                        key={item.id}
                                        className="bg-slate-50/70 dark:bg-[#111827]/70 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                    >
                                        <div className="min-w-0 space-y-1.5">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-mono text-xs font-bold text-app-navy dark:text-white bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                                    {item.voucher_code}
                                                </span>
                                                <span className="text-sm font-extrabold text-app-navy dark:text-white truncate">
                                                    {item.reward?.name || 'Recompensa'}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-app-graytext dark:text-slate-400">
                                                <span className="font-bold text-[#ea7349]">{item.points_cost} PTS</span>
                                                <span>•</span>
                                                <span>{formatDateShort(item.created_at)}</span>
                                                <span>•</span>
                                                <span className="inline-flex items-center gap-1 font-semibold">
                                                    {isPending && (
                                                        <>
                                                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                                                            <span className="text-amber-600 dark:text-amber-400">Aguardando Validação</span>
                                                        </>
                                                    )}
                                                    {isCompleted && (
                                                        <>
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-[#4bb9a6]" />
                                                            <span className="text-[#4bb9a6]">Validado</span>
                                                        </>
                                                    )}
                                                    {isCancelled && (
                                                        <>
                                                            <XCircle className="w-3.5 h-3.5 text-rose-500" />
                                                            <span className="text-rose-500">Cancelado / Estornado</span>
                                                        </>
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end shrink-0">
                                            {isAacc && !isCancelled && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openAaccCertificatePrint({
                                                            studentName: userName,
                                                            studentEmail: userEmail,
                                                            rewardName: item.reward?.name || 'Horas AACC',
                                                            pointsCost: item.points_cost,
                                                            voucherCode: item.voucher_code,
                                                            issuedAt: item.created_at,
                                                        })
                                                    }
                                                    className="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#4bb9a6] hover:bg-[#3da392] text-white shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                                                >
                                                    <Printer className="w-4 h-4" />
                                                    <span>Baixar Certificado (PDF)</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            <RewardFormModal
                isOpen={isAdminModalOpen}
                editingReward={editingReward}
                formName={formName}
                formDescription={formDescription}
                formTag={formTag}
                formCost={formCost}
                formHours={formHours}
                formImage={formImage}
                formError={formError}
                isSaving={isSaving}
                onClose={() => setIsAdminModalOpen(false)}
                onChangeName={setFormName}
                onChangeDescription={setFormDescription}
                onChangeTag={setFormTag}
                onChangeCost={setFormCost}
                onChangeHours={setFormHours}
                onChangeImage={setFormImage}
                onSubmit={handleSaveReward}
            />
        </div>
    );
};

export default RewardsStoreSection;
