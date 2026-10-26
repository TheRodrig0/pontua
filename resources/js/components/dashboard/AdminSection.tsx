import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ReceiptText,
    Sparkles,
    Gift,
    Plus,
    Pencil,
    Trash2,
    RefreshCw,
    Check,
    Clock,
    AlertCircle,
    Users,
    Upload,
    Loader2,
    Search,
    X,
} from 'lucide-react';
import ModalDialog from '@/components/ui/ModalDialog';
import { apiRequest } from '@/lib/api';
import type {
    AdminOverviewData,
    AdminUserData,
    RewardItem,
    RewardTagValue,
} from '@/types/dashboard';

interface AdminSectionProps {
    onRewardsMutated: () => void;
}

type AdminSubTab = 'rewards' | 'receipts' | 'users';

const TAG_LABELS: Record<RewardTagValue, string> = {
    clothing: 'Vestuário',
    accessory: 'Acessório',
    cosmetic: 'Cosmético',
    other: 'Outros',
};

function formatCurrencyBRL(value: string | number): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (Number.isNaN(num)) {
        return 'R$ 0,00';
    }
    return num.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

function formatAccessKeyPreview(key: string): string {
    if (!key) {
        return '---- ---- ---- ---- ----...';
    }
    const clean = key.replace(/\D/g, '').slice(0, 20);
    const groups = clean.match(/.{1,4}/g) || [key.slice(0, 20)];
    return `${groups.join(' ')}...`;
}

export const AdminSection: React.FC<AdminSectionProps> = ({
    onRewardsMutated,
}) => {
    const [data, setData] = useState<AdminOverviewData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [subTab, setSubTab] = useState<AdminSubTab>('rewards');

    // Modal de Criar / Editar Prêmio
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReward, setEditingReward] = useState<RewardItem | null>(null);
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formTag, setFormTag] = useState<RewardTagValue>('clothing');
    const [formCost, setFormCost] = useState('');
    const [formImage, setFormImage] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    // Modal de Edição de Usuário
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUserData | null>(null);
    const [userFormName, setUserFormName] = useState('');
    const [userFormEmail, setUserFormEmail] = useState('');
    const [userFormNick, setUserFormNick] = useState('');
    const [userFormRole, setUserFormRole] = useState<'user' | 'admin'>('user');
    const [userFormPassword, setUserFormPassword] = useState('');
    const [isSavingUser, setIsSavingUser] = useState(false);
    const [userFormError, setUserFormError] = useState<string | null>(null);

    const fetchAdminOverview = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await apiRequest<AdminOverviewData>('/api/admin/overview');
            setData(res);
        } catch {
            // Ignore
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAdminOverview();
    }, [fetchAdminOverview]);

    const openCreateModal = () => {
        setEditingReward(null);
        setFormName('');
        setFormDescription('');
        setFormTag('clothing');
        setFormCost('');
        setFormImage(null);
        setFormError(null);
        setIsModalOpen(true);
    };

    const openEditModal = (reward: RewardItem) => {
        setEditingReward(reward);
        setFormName(reward.name);
        setFormDescription(reward.description || '');
        setFormTag(reward.tag || 'other');
        setFormCost(String(reward.cost));
        setFormImage(null);
        setFormError(null);
        setIsModalOpen(true);
    };

    const handleSaveReward = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormError(null);

        const parsedCost = parseInt(formCost, 10);
        if (!formName.trim() || Number.isNaN(parsedCost) || parsedCost < 1) {
            setFormError('Informe o nome e um custo válido em pontos (mínimo 1).');
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
                await apiRequest(`/api/rewards/${editingReward.id}`, {
                    method: 'POST',
                    body: formData,
                });
            } else {
                await apiRequest('/api/rewards', {
                    method: 'POST',
                    body: formData,
                });
            }
            setIsModalOpen(false);
            await fetchAdminOverview();
            onRewardsMutated();
        } catch (err: any) {
            setFormError(err.message || 'Erro ao salvar prêmio.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteReward = async (rewardId: number) => {
        setDeletingId(rewardId);
        try {
            await apiRequest(`/api/rewards/${rewardId}`, {
                method: 'DELETE',
            });
            await fetchAdminOverview();
            onRewardsMutated();
        } catch {
            // Ignore
        } finally {
            setDeletingId(null);
        }
    };

    const openEditUserModal = (u: AdminUserData) => {
        setEditingUser(u);
        setUserFormName(u.name);
        setUserFormEmail(u.email);
        setUserFormNick(u.nick || '');
        setUserFormRole(u.role === 'admin' ? 'admin' : 'user');
        setUserFormPassword('');
        setUserFormError(null);
        setIsUserModalOpen(true);
    };

    const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingUser) return;
        setUserFormError(null);

        if (!userFormName.trim()) {
            setUserFormError('O nome do usuário é obrigatório.');
            return;
        }
        if (!userFormEmail.trim()) {
            setUserFormError('O e-mail é obrigatório.');
            return;
        }

        setIsSavingUser(true);
        try {
            const payload: Record<string, any> = {
                name: userFormName.trim(),
                email: userFormEmail.trim(),
                nick: userFormNick.trim() ? userFormNick.trim().replace(/^@/, '') : null,
                role: userFormRole,
            };

            if (userFormPassword.trim()) {
                if (userFormPassword.trim().length < 8) {
                    setUserFormError('A nova senha deve ter no mínimo 8 caracteres.');
                    setIsSavingUser(false);
                    return;
                }
                payload.password = userFormPassword.trim();
            }

            await apiRequest(`/api/admin/users/${editingUser.id}`, {
                method: 'PATCH',
                body: JSON.stringify(payload),
            });

            setIsUserModalOpen(false);
            await fetchAdminOverview();
        } catch (err: any) {
            setUserFormError(err.message || 'Erro ao atualizar usuário.');
        } finally {
            setIsSavingUser(false);
        }
    };

    const [searchQuery, setSearchQuery] = useState('');

    const stats = data?.stats;
    const rewards = data?.rewards || [];
    const receipts = data?.recent_receipts || [];
    const users = data?.users || [];

    const filteredRewards = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return rewards;
        return rewards.filter((r) => {
            const nameMatch = r.name.toLowerCase().includes(q);
            const descMatch = (r.description || '').toLowerCase().includes(q);
            const tagMatch = (TAG_LABELS[r.tag] || r.tag).toLowerCase().includes(q);
            return nameMatch || descMatch || tagMatch;
        });
    }, [rewards, searchQuery]);

    const filteredReceipts = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return receipts;
        return receipts.filter((r) => {
            const userName = (r.user?.name || '').toLowerCase().includes(q);
            const userNick = (r.user?.nick || '').toLowerCase().includes(q);
            const userEmail = (r.user?.email || '').toLowerCase().includes(q);
            const keyMatch = (r.access_key || '').toLowerCase().includes(q);
            const statusMatch = (r.status || '').toLowerCase().includes(q);
            return userName || userNick || userEmail || keyMatch || statusMatch;
        });
    }, [receipts, searchQuery]);

    const filteredUsers = useMemo(() => {
        const q = searchQuery.trim().toLowerCase().replace(/^@/, '');
        if (!q) return users;
        return users.filter((u) => {
            const nameMatch = (u.name || '').toLowerCase().includes(q);
            const nickMatch = (u.nick || '').toLowerCase().includes(q);
            const emailMatch = (u.email || '').toLowerCase().includes(q);
            const roleMatch = (u.role === 'admin' ? 'admin administrador' : 'aluno').includes(q);
            return nameMatch || nickMatch || emailMatch || roleMatch;
        });
    }, [users, searchQuery]);

    return (
        <div className="space-y-6">
            {/* 1. Three KPI Metric Cards (Mesmo padrão da Visão Geral) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Card 1: Notas Fiscais */}
                <div className="bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-app-graytext dark:text-slate-400">
                            Notas Fiscais Recebidas
                        </span>
                        <ReceiptText className="w-4 h-4 text-[#4bb9a6]" />
                    </div>

                    <div className="my-3 flex items-baseline gap-1.5">
                        <span className="text-3xl sm:text-4xl font-extrabold text-app-navy dark:text-white tracking-tight tabular-nums">
                            {stats?.total_receipts ?? 0}
                        </span>
                        <span className="text-xs font-extrabold text-[#4bb9a6] uppercase tracking-wider">
                            NOTAS
                        </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-[11px] text-app-graytext dark:text-slate-400">
                            {stats?.approved_receipts ?? 0} aprovadas ·{' '}
                            {formatCurrencyBRL(stats?.total_value_donated ?? 0)}
                        </span>
                        <button
                            type="button"
                            onClick={() => setSubTab('receipts')}
                            className="text-[11px] font-bold text-[#4bb9a6] hover:underline cursor-pointer"
                        >
                            Ver notas →
                        </button>
                    </div>
                </div>

                {/* Card 2: Pontos e Usuários */}
                <div className="bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-app-graytext dark:text-slate-400">
                            Pontos Distribuídos
                        </span>
                        <Sparkles className="w-4 h-4 text-[#ea7349]" />
                    </div>

                    <div className="my-3 flex items-baseline gap-1.5">
                        <span className="text-3xl sm:text-4xl font-extrabold text-app-navy dark:text-white tracking-tight tabular-nums">
                            {(stats?.total_points_distributed ?? 0).toLocaleString('pt-BR')}
                        </span>
                        <span className="text-xs font-extrabold text-[#ea7349] uppercase tracking-wider">
                            PTS
                        </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-[11px] text-app-graytext dark:text-slate-400">
                            {stats?.total_users ?? 0} usuários cadastrados
                        </span>
                        <button
                            type="button"
                            onClick={() => setSubTab('users')}
                            className="text-[11px] font-bold text-[#ea7349] hover:underline cursor-pointer"
                        >
                            Ver usuários →
                        </button>
                    </div>
                </div>

                {/* Card 3: Catálogo de Prêmios */}
                <div className="bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-app-graytext dark:text-slate-400">
                            Catálogo de Prêmios
                        </span>
                        <Gift className="w-4 h-4 text-[#4bb9a6]" />
                    </div>

                    <div className="my-3 flex items-baseline gap-1.5">
                        <span className="text-3xl sm:text-4xl font-extrabold text-app-navy dark:text-white tracking-tight tabular-nums">
                            {stats?.total_rewards ?? rewards.length}
                        </span>
                        <span className="text-xs font-extrabold text-[#4bb9a6] uppercase tracking-wider">
                            ITENS
                        </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-[11px] text-app-graytext dark:text-slate-400">
                            Disponíveis na loja estudantil
                        </span>
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="text-[11px] font-bold text-[#4bb9a6] hover:underline cursor-pointer"
                        >
                            Novo prêmio →
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. Banner de Ação Administrativa (Mesmo padrão da Visão Geral) */}
            <div className="bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-start sm:items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#4bb9a6]/15 dark:bg-[#112a2e] border border-[#4bb9a6]/25 dark:border-[#4bb9a6]/20 text-[#4bb9a6] flex items-center justify-center shrink-0">
                        <Gift className="w-6 h-6" />
                    </div>

                    <div>
                        <h2 className="text-base sm:text-lg font-extrabold text-app-navy dark:text-white tracking-tight">
                            Gerenciar Recompensas e Relatórios
                        </h2>
                        <p className="text-xs text-app-graytext dark:text-slate-400 mt-0.5 leading-relaxed">
                            Cadastre novos itens no catálogo da loja, acompanhe os cupons validados para a APAE e consulte os alunos participantes.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={openCreateModal}
                    className="w-full sm:w-auto bg-[#4bb9a6] hover:bg-[#3da392] text-white text-xs font-extrabold uppercase tracking-wider px-5 py-3 rounded-xl inline-flex items-center justify-center gap-2 shadow-md shadow-[#4bb9a6]/20 transition-all cursor-pointer shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    <span>CADASTRAR PRÊMIO</span>
                </button>
            </div>

            {/* 3. Lista Principal com Abas (Prêmios / Notas / Usuários) */}
            <div className="bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                    <div>
                        <h3 className="text-base font-extrabold text-app-navy dark:text-white tracking-tight">
                            {subTab === 'rewards' && 'Prêmios Cadastrados na Loja'}
                            {subTab === 'receipts' && 'Últimas Notas Fiscais Enviadas'}
                            {subTab === 'users' && 'Usuários Cadastrados'}
                        </h3>
                        <p className="text-[11px] text-app-graytext dark:text-slate-400 mt-0.5">
                            {subTab === 'rewards' && 'Adicione, edite ou remova recompensas do catálogo'}
                            {subTab === 'receipts' && 'Histórico geral de cupons enviados pelos alunos'}
                            {subTab === 'users' && 'Participantes registrados na plataforma'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="inline-flex bg-slate-100 dark:bg-[#111827] p-1 rounded-xl border border-slate-200/70 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => {
                                    setSubTab('rewards');
                                    setSearchQuery('');
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                    subTab === 'rewards'
                                        ? 'bg-white dark:bg-[#182234] text-app-navy dark:text-white shadow-xs'
                                        : 'text-app-graytext dark:text-slate-400 hover:text-app-navy dark:hover:text-white'
                                }`}
                            >
                                Prêmios ({rewards.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setSubTab('receipts');
                                    setSearchQuery('');
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                    subTab === 'receipts'
                                        ? 'bg-white dark:bg-[#182234] text-app-navy dark:text-white shadow-xs'
                                        : 'text-app-graytext dark:text-slate-400 hover:text-app-navy dark:hover:text-white'
                                }`}
                            >
                                Notas ({receipts.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setSubTab('users');
                                    setSearchQuery('');
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                    subTab === 'users'
                                        ? 'bg-white dark:bg-[#182234] text-app-navy dark:text-white shadow-xs'
                                        : 'text-app-graytext dark:text-slate-400 hover:text-app-navy dark:hover:text-white'
                                }`}
                            >
                                Usuários ({users.length})
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={fetchAdminOverview}
                            title="Atualizar dados"
                            aria-label="Atualizar dados"
                            className="p-2 rounded-lg text-app-graytext dark:text-slate-400 hover:text-app-navy dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                            <RefreshCw
                                className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#4bb9a6]' : ''}`}
                            />
                        </button>
                    </div>
                </div>

                {/* Barra de Pesquisa */}
                <div className="mb-4">
                    <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 focus-within:border-[#4bb9a6] transition-colors">
                        <Search className="w-4 h-4 text-app-graytext dark:text-slate-400 shrink-0" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={
                                subTab === 'rewards'
                                    ? 'Pesquisar prêmio por nome, descrição ou categoria...'
                                    : subTab === 'receipts'
                                    ? 'Pesquisar nota por aluno, chave de acesso ou status...'
                                    : 'Pesquisar usuário por nome, @apelido ou e-mail...'
                            }
                            className="w-full bg-transparent text-xs text-app-navy dark:text-white placeholder:text-app-graytext dark:placeholder:text-slate-500 focus:outline-none"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-app-graytext dark:text-slate-400 cursor-pointer transition-colors"
                                title="Limpar pesquisa"
                                aria-label="Limpar pesquisa"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Aba 1: Prêmios */}
                {subTab === 'rewards' && (
                    <div className="divide-y divide-slate-200/70 dark:divide-slate-800/80">
                        {rewards.length === 0 ? (
                            <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                <Gift className="w-9 h-9 text-slate-400 dark:text-slate-500 mx-auto mb-2.5" />
                                <p className="text-sm font-bold text-app-navy dark:text-slate-300">
                                    Nenhum prêmio cadastrado
                                </p>
                            </div>
                        ) : filteredRewards.length === 0 ? (
                            <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                <Search className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
                                <p className="text-sm font-bold text-app-navy dark:text-slate-300">
                                    Nenhum prêmio encontrado
                                </p>
                                <p className="text-xs text-app-graytext dark:text-slate-400 mt-1">
                                    Nenhum item corresponde a &quot;{searchQuery}&quot;.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="mt-3 text-xs font-bold text-[#4bb9a6] hover:underline cursor-pointer"
                                >
                                    Limpar busca
                                </button>
                            </div>
                        ) : (
                            filteredRewards.map((reward) => (
                                <div
                                    key={reward.id}
                                    className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                >
                                    <div className="flex items-start sm:items-center gap-3.5">
                                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-app-graytext dark:text-slate-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                                            <Gift className="w-4 h-4" />
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-sm font-extrabold text-app-navy dark:text-white">
                                                    {reward.name}
                                                </span>
                                                <span className="bg-[#4bb9a6]/15 dark:bg-[#112a2e] text-[#4bb9a6] border border-[#4bb9a6]/25 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                    {TAG_LABELS[reward.tag] || reward.tag}
                                                </span>
                                            </div>
                                            {reward.description && (
                                                <p className="text-[11px] text-app-graytext dark:text-slate-400 mt-0.5">
                                                    {reward.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-3 pl-12 sm:pl-0">
                                        <span className="bg-[#4bb9a6]/15 dark:bg-[#112a2e] text-[#4bb9a6] border border-[#4bb9a6]/25 text-[11px] font-extrabold px-3 py-1 rounded-full whitespace-nowrap tabular-nums">
                                            {reward.cost.toLocaleString('pt-BR')} pts
                                        </span>

                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(reward)}
                                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-app-graytext dark:text-slate-300 hover:text-app-navy dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                                title="Editar prêmio"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteReward(reward.id)}
                                                disabled={deletingId === reward.id}
                                                className="p-2 rounded-lg border border-rose-200 dark:border-rose-900/50 text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-50"
                                                title="Excluir prêmio"
                                            >
                                                {deletingId === reward.id ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Aba 2: Notas Fiscais */}
                {subTab === 'receipts' && (
                    <div className="divide-y divide-slate-200/70 dark:divide-slate-800/80">
                        {receipts.length === 0 ? (
                            <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                <ReceiptText className="w-9 h-9 text-slate-400 dark:text-slate-500 mx-auto mb-2.5" />
                                <p className="text-sm font-bold text-app-navy dark:text-slate-300">
                                    Nenhuma nota fiscal registrada
                                </p>
                            </div>
                        ) : filteredReceipts.length === 0 ? (
                            <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                <Search className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
                                <p className="text-sm font-bold text-app-navy dark:text-slate-300">
                                    Nenhuma nota fiscal encontrada
                                </p>
                                <p className="text-xs text-app-graytext dark:text-slate-400 mt-1">
                                    Nenhuma nota corresponde a &quot;{searchQuery}&quot;.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="mt-3 text-xs font-bold text-[#4bb9a6] hover:underline cursor-pointer"
                                >
                                    Limpar busca
                                </button>
                            </div>
                        ) : (
                            filteredReceipts.map((receipt) => {
                                const isApproved = receipt.status === 'approved';
                                const isPending = receipt.status === 'pending';

                                return (
                                    <div
                                        key={receipt.id}
                                        className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                    >
                                        <div className="flex items-start sm:items-center gap-3.5">
                                            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-app-graytext dark:text-slate-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                                                <ReceiptText className="w-4 h-4" />
                                            </div>

                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-sm font-extrabold text-app-navy dark:text-white">
                                                        {formatCurrencyBRL(receipt.value)}
                                                    </span>

                                                    {receipt.user && (
                                                        <span className="text-xs font-semibold text-app-graytext dark:text-slate-300">
                                                            · {receipt.user.name}
                                                        </span>
                                                    )}

                                                    {isApproved && (
                                                        <span className="bg-[#4bb9a6]/15 dark:bg-[#112a2e] text-[#4bb9a6] border border-[#4bb9a6]/25 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                                            <Check className="w-3 h-3" />
                                                            <span>Aprovado</span>
                                                        </span>
                                                    )}

                                                    {isPending && (
                                                        <span className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            <span>Em análise</span>
                                                        </span>
                                                    )}

                                                    {!isApproved && !isPending && (
                                                        <span className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            <span>Rejeitado</span>
                                                        </span>
                                                    )}
                                                </div>

                                                <span className="block font-mono text-[11px] text-slate-400 dark:text-slate-500 tracking-wider mt-0.5">
                                                    {formatAccessKeyPreview(receipt.access_key)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end pl-12 sm:pl-0">
                                            <span className="bg-[#4bb9a6]/15 dark:bg-[#112a2e] text-[#4bb9a6] border border-[#4bb9a6]/25 text-[11px] font-extrabold px-3 py-1 rounded-full whitespace-nowrap tabular-nums">
                                                +{receipt.points_earned} pts
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* Aba 3: Usuários */}
                {subTab === 'users' && (
                    <div className="divide-y divide-slate-200/70 dark:divide-slate-800/80">
                        {users.length === 0 ? (
                            <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                <Users className="w-9 h-9 text-slate-400 dark:text-slate-500 mx-auto mb-2.5" />
                                <p className="text-sm font-bold text-app-navy dark:text-slate-300">
                                    Nenhum usuário cadastrado
                                </p>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                <Search className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
                                <p className="text-sm font-bold text-app-navy dark:text-slate-300">
                                    Nenhum usuário encontrado
                                </p>
                                <p className="text-xs text-app-graytext dark:text-slate-400 mt-1">
                                    Nenhum usuário corresponde a &quot;{searchQuery}&quot;.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="mt-3 text-xs font-bold text-[#4bb9a6] hover:underline cursor-pointer"
                                >
                                    Limpar busca
                                </button>
                            </div>
                        ) : (
                            filteredUsers.map((u) => (
                                <div
                                    key={u.id}
                                    className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                >
                                    <div className="flex items-start sm:items-center gap-3.5">
                                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-app-graytext dark:text-slate-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                                            <Users className="w-4 h-4" />
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-sm font-extrabold text-app-navy dark:text-white">
                                                    {u.name}
                                                </span>
                                                {u.nick && (
                                                    <span className="text-xs font-semibold text-[#4bb9a6]">
                                                        @{u.nick}
                                                    </span>
                                                )}
                                                <span
                                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                                        u.role === 'admin'
                                                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25'
                                                            : 'bg-slate-100 dark:bg-slate-800 text-app-graytext dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                                    }`}
                                                >
                                                    {u.role === 'admin' ? 'Admin' : 'Aluno'}
                                                </span>
                                            </div>

                                            <span className="block text-[11px] text-app-graytext dark:text-slate-400 mt-0.5">
                                                {u.email} · {u.total_receipts}{' '}
                                                {u.total_receipts === 1 ? 'nota enviada' : 'notas enviadas'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-3 pl-12 sm:pl-0">
                                        <span className="bg-[#4bb9a6]/15 dark:bg-[#112a2e] text-[#4bb9a6] border border-[#4bb9a6]/25 text-[11px] font-extrabold px-3 py-1 rounded-full whitespace-nowrap tabular-nums">
                                            {u.current_balance.toLocaleString('pt-BR')} pts
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => openEditUserModal(u)}
                                            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-app-graytext dark:text-slate-300 hover:text-app-navy dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                            title="Editar usuário"
                                            aria-label={`Editar ${u.name}`}
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Modal de Cadastro / Edição de Prêmio */}
            <ModalDialog
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingReward ? 'Editar Prêmio' : 'Cadastrar Novo Prêmio'}
                subtitle="Preencha os dados da recompensa que ficará disponível na loja."
            >
                <form onSubmit={handleSaveReward} className="space-y-4">
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
                            onChange={(e) => setFormName(e.target.value)}
                            placeholder="Ex: Camiseta Oficial GTI"
                            className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-app-navy dark:text-white focus:outline-none focus:border-[#4bb9a6]"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                                onChange={(e) => setFormTag(e.target.value as RewardTagValue)}
                                className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-app-navy dark:text-white focus:outline-none focus:border-[#4bb9a6]"
                            >
                                <option value="clothing">Vestuário</option>
                                <option value="accessory">Acessório</option>
                                <option value="cosmetic">Cosmético</option>
                                <option value="other">Outros</option>
                            </select>
                        </div>

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
                                onChange={(e) => setFormCost(e.target.value)}
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
                            onChange={(e) => setFormDescription(e.target.value)}
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
                                onChange={(e) => setFormImage(e.target.files?.[0] || null)}
                                className="hidden"
                            />
                        </label>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
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

            {/* Modal de Edição de Usuário */}
            <ModalDialog
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                title="Editar Usuário"
                subtitle={`Atualize as informações cadastrais e permissões de ${editingUser?.name || 'usuário'}.`}
            >
                <form onSubmit={handleSaveUser} className="space-y-4">
                    {userFormError && (
                        <div className="bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 rounded-xl p-3.5 text-xs flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                            <span>{userFormError}</span>
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="admin-user-name"
                            className="block text-xs font-bold text-app-navy dark:text-slate-200 mb-1.5"
                        >
                            Nome Completo
                        </label>
                        <input
                            id="admin-user-name"
                            type="text"
                            maxLength={100}
                            value={userFormName}
                            onChange={(e) => setUserFormName(e.target.value)}
                            placeholder="Ex: João Silva"
                            className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-app-navy dark:text-white focus:outline-none focus:border-[#4bb9a6]"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                            <label
                                htmlFor="admin-user-nick"
                                className="block text-xs font-bold text-app-navy dark:text-slate-200 mb-1.5"
                            >
                                @Apelido (Nick)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                    @
                                </span>
                                <input
                                    id="admin-user-nick"
                                    type="text"
                                    maxLength={30}
                                    value={userFormNick}
                                    onChange={(e) => setUserFormNick(e.target.value.replace(/^@/, ''))}
                                    placeholder="joaosilva"
                                    className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-app-navy dark:text-white focus:outline-none focus:border-[#4bb9a6]"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="admin-user-role"
                                className="block text-xs font-bold text-app-navy dark:text-slate-200 mb-1.5"
                            >
                                Perfil de Acesso
                            </label>
                            <select
                                id="admin-user-role"
                                value={userFormRole}
                                onChange={(e) => setUserFormRole(e.target.value as 'user' | 'admin')}
                                className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-app-navy dark:text-white focus:outline-none focus:border-[#4bb9a6]"
                            >
                                <option value="user">Aluno (Padrão)</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="admin-user-email"
                            className="block text-xs font-bold text-app-navy dark:text-slate-200 mb-1.5"
                        >
                            E-mail
                        </label>
                        <input
                            id="admin-user-email"
                            type="email"
                            value={userFormEmail}
                            onChange={(e) => setUserFormEmail(e.target.value)}
                            placeholder="aluno@fatec.sp.gov.br"
                            className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-app-navy dark:text-white focus:outline-none focus:border-[#4bb9a6]"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="admin-user-password"
                            className="block text-xs font-bold text-app-navy dark:text-slate-200 mb-1.5"
                        >
                            Redefinir Senha (opcional)
                        </label>
                        <input
                            id="admin-user-password"
                            type="password"
                            value={userFormPassword}
                            onChange={(e) => setUserFormPassword(e.target.value)}
                            placeholder="Deixe em branco para manter a senha atual"
                            minLength={8}
                            className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-app-navy dark:text-white focus:outline-none focus:border-[#4bb9a6]"
                        />
                        <p className="text-[11px] text-app-graytext dark:text-slate-400 mt-1">
                            Preencha somente se desejar alterar a senha de acesso deste participante (mínimo 8 dígitos).
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsUserModalOpen(false)}
                            className="px-4 py-2.5 rounded-xl text-xs font-bold text-app-graytext dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={isSavingUser}
                            className="bg-[#4bb9a6] hover:bg-[#3da392] disabled:opacity-60 text-white text-xs font-extrabold uppercase tracking-wider px-5 py-2.5 rounded-xl inline-flex items-center gap-2 shadow-md shadow-[#4bb9a6]/20 transition-all cursor-pointer"
                        >
                            {isSavingUser && <Loader2 className="w-4 h-4 animate-spin" />}
                            <span>{isSavingUser ? 'Salvando...' : 'Salvar Alterações'}</span>
                        </button>
                    </div>
                </form>
            </ModalDialog>
        </div>
    );
};

export default AdminSection;
