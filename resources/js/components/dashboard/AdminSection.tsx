import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, KeyRound, RefreshCw, Search, X } from 'lucide-react';
import { AdminReceiptsList } from '@/components/dashboard/admin/AdminReceiptsList';
import { AdminRedemptionsList } from '@/components/dashboard/admin/AdminRedemptionsList';
import { AdminRewardsList } from '@/components/dashboard/admin/AdminRewardsList';
import { AdminStatsGrid, type AdminSubTab } from '@/components/dashboard/admin/AdminStatsGrid';
import { AdminUsersList } from '@/components/dashboard/admin/AdminUsersList';
import { RewardFormModal } from '@/components/dashboard/admin/RewardFormModal';
import { UserEditModal } from '@/components/dashboard/admin/UserEditModal';
import { REWARD_TAG_LABELS, RewardTag } from '@/enums/dashboard';
import { adminService } from '@/services/adminService';
import {
    redemptionService,
    type RewardRedemptionRequest,
} from '@/services/redemptionService';
import { rewardService } from '@/services/rewardService';
import type {
    AdminOverviewData,
    AdminUserData,
    RewardItem,
    RewardTagValue,
} from '@/types/dashboard';

interface AdminSectionProps {
    onRewardsMutated: () => void;
}

export const AdminSection: React.FC<AdminSectionProps> = ({ onRewardsMutated }) => {
    const [data, setData] = useState<AdminOverviewData | null>(null);
    const [redemptions, setRedemptions] = useState<RewardRedemptionRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [subTab, setSubTab] = useState<AdminSubTab>('rewards');
    const [searchQuery, setSearchQuery] = useState('');

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
            const [overview, redemptionsRes] = await Promise.all([
                adminService.getOverview(),
                redemptionService.adminList(),
            ]);
            setData(overview);
            setRedemptions(redemptionsRes.data || []);
        } catch (err: any) {
            console.error('Falha ao carregar dados administrativos:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAdminOverview();
    }, [fetchAdminOverview]);

    const handleValidateRedemption = useCallback(
        async (id: number, status: 'completed' | 'cancelled') => {
            try {
                const updated = await redemptionService.adminUpdate(id, status);
                setRedemptions((prev) =>
                    prev.map((item) => (item.id === id ? updated : item))
                );
                // Atualiza contadores globais e estoque de recompensas
                fetchAdminOverview();
                onRewardsMutated();
            } catch (err: any) {
                alert(err.message || 'Falha ao atualizar pedido de resgate.');
            }
        },
        [fetchAdminOverview, onRewardsMutated]
    );

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
        const isInvalidRewardInput = !formName.trim() || Number.isNaN(parsedCost) || parsedCost < 1;

        if (isInvalidRewardInput) {
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
            const isEditingExisting = Boolean(editingReward);
            if (isEditingExisting) {
                await rewardService.update(editingReward!.id, formData);
            } else {
                await rewardService.store(formData);
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
            await rewardService.destroy(rewardId);
            await fetchAdminOverview();
            onRewardsMutated();
        } catch {
            // Ignore error
        } finally {
            setDeletingId(null);
        }
    };

    const openEditUserModal = (user: AdminUserData) => {
        setEditingUser(user);
        setUserFormName(user.name);
        setUserFormEmail(user.email);
        setUserFormNick(user.nick || '');
        setUserFormRole(user.role === 'admin' ? 'admin' : 'user');
        setUserFormPassword('');
        setUserFormError(null);
        setIsUserModalOpen(true);
    };

    const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const hasEditingUser = Boolean(editingUser);
        if (!hasEditingUser) {
            return;
        }
        setUserFormError(null);

        const isNameEmpty = !userFormName.trim();
        if (isNameEmpty) {
            setUserFormError('O nome do usuário é obrigatório.');
            return;
        }

        const isEmailEmpty = !userFormEmail.trim();
        if (isEmailEmpty) {
            setUserFormError('O e-mail é obrigatório.');
            return;
        }

        setIsSavingUser(true);
        try {
            const payload: Record<string, unknown> = {
                name: userFormName.trim(),
                email: userFormEmail.trim(),
                nick: userFormNick.trim() ? userFormNick.trim().replace(/^@/, '') : null,
                role: userFormRole,
            };

            const hasNewPassword = Boolean(userFormPassword.trim());
            if (hasNewPassword) {
                const isPasswordTooShort = userFormPassword.trim().length < 8;
                if (isPasswordTooShort) {
                    setUserFormError('A nova senha deve ter no mínimo 8 caracteres.');
                    setIsSavingUser(false);
                    return;
                }
                payload.password = userFormPassword.trim();
            }

            await adminService.updateUser(editingUser!.id, payload);
            setIsUserModalOpen(false);
            await fetchAdminOverview();
        } catch (err: any) {
            setUserFormError(err.message || 'Erro ao atualizar usuário.');
        } finally {
            setIsSavingUser(false);
        }
    };

    const stats = data?.stats;
    const rewards = data?.rewards || [];
    const receipts = data?.recent_receipts || [];
    const users = data?.users || [];
    const pendingRedemptions = useMemo(
        () => redemptions.filter((item) => item.status === 'pending'),
        [redemptions]
    );

    const filteredRewards = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        const isQueryEmpty = !query;
        if (isQueryEmpty) {
            return rewards;
        }
        return rewards.filter((reward) => {
            const nameMatch = reward.name.toLowerCase().includes(query);
            const descMatch = (reward.description || '').toLowerCase().includes(query);
            const tagLabel = REWARD_TAG_LABELS[reward.tag as RewardTag] || reward.tag;
            const tagMatch = tagLabel.toLowerCase().includes(query);
            return nameMatch || descMatch || tagMatch;
        });
    }, [rewards, searchQuery]);

    const filteredRedemptions = useMemo(() => {
        const query = searchQuery.trim().toLowerCase().replace(/^[@#]/, '');
        if (!query) {
            return redemptions;
        }
        return redemptions.filter((item) => {
            const codeMatch = item.voucher_code.toLowerCase().includes(query);
            const userMatch = item.user?.name.toLowerCase().includes(query) ?? false;
            const nickMatch = (item.user?.nick || '').toLowerCase().includes(query);
            const rewardMatch = (item.reward?.name || '').toLowerCase().includes(query);
            return codeMatch || userMatch || nickMatch || rewardMatch;
        });
    }, [redemptions, searchQuery]);

    const filteredReceipts = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        const isQueryEmpty = !query;
        if (isQueryEmpty) {
            return receipts;
        }
        return receipts.filter((receipt) => {
            const userName = (receipt.user?.name || '').toLowerCase().includes(query);
            const userNick = (receipt.user?.nick || '').toLowerCase().includes(query);
            const userEmail = (receipt.user?.email || '').toLowerCase().includes(query);
            const keyMatch = (receipt.access_key || '').toLowerCase().includes(query);
            const statusMatch = (receipt.status || '').toLowerCase().includes(query);
            return userName || userNick || userEmail || keyMatch || statusMatch;
        });
    }, [receipts, searchQuery]);

    const filteredUsers = useMemo(() => {
        const query = searchQuery.trim().toLowerCase().replace(/^@/, '');
        const isQueryEmpty = !query;
        if (isQueryEmpty) {
            return users;
        }
        return users.filter((user) => {
            const nameMatch = (user.name || '').toLowerCase().includes(query);
            const nickMatch = (user.nick || '').toLowerCase().includes(query);
            const emailMatch = (user.email || '').toLowerCase().includes(query);
            const roleMatch = (user.role === 'admin' ? 'admin administrador' : 'aluno').includes(query);
            return nameMatch || nickMatch || emailMatch || roleMatch;
        });
    }, [users, searchQuery]);

    return (
        <div className="space-y-6">
            <AdminStatsGrid
                stats={stats}
                rewardsCount={rewards.length}
                onSelectSubTab={setSubTab}
                onOpenCreateRewardModal={openCreateModal}
            />

            {/* Subtle, evident Redemption Validation strip */}
            {pendingRedemptions.length > 0 && subTab !== 'redemptions' && (
                <div className="bg-amber-500/[0.06] dark:bg-amber-500/[0.08] border border-amber-500/30 dark:border-amber-500/25 rounded-2xl px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0">
                            <Clock className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-extrabold text-app-navy dark:text-white">
                                    {pendingRedemptions.length === 1
                                        ? '1 pedido de resgate aguardando validação'
                                        : `${pendingRedemptions.length} pedidos de resgate aguardando validação`}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-900/80 text-app-navy dark:text-amber-300 border border-amber-500/25">
                                    <KeyRound className="w-2.5 h-2.5 text-amber-500" />
                                    {pendingRedemptions[0].voucher_code}
                                </span>
                            </div>
                            <p className="text-[11px] text-app-graytext dark:text-slate-400 truncate mt-0.5">
                                Último pedido: <strong className="text-app-navy dark:text-slate-200">{pendingRedemptions[0].user?.name || 'Estudante'}</strong> solicitou{' '}
                                <strong className="text-app-navy dark:text-slate-200">{pendingRedemptions[0].reward?.name || 'Recompensa'}</strong> ({pendingRedemptions[0].points_cost} PTS)
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={() => handleValidateRedemption(pendingRedemptions[0].id, 'completed')}
                            className="px-3 py-1.5 rounded-lg text-[11px] font-extrabold bg-[#4bb9a6] hover:bg-[#3da392] text-white inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                            title={`Validar imediatamente ${pendingRedemptions[0].voucher_code}`}
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Validar {pendingRedemptions[0].voucher_code}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setSubTab('redemptions');
                                setSearchQuery('');
                            }}
                            className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white dark:bg-[#182234] hover:bg-slate-50 dark:hover:bg-slate-800 text-app-navy dark:text-white border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                        >
                            Ver fila →
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                    <div>
                        <h3 className="text-base font-extrabold text-app-navy dark:text-white tracking-tight">
                            {subTab === 'rewards' && 'Prêmios Cadastrados na Loja'}
                            {subTab === 'redemptions' && 'Validação de Pedidos de Resgate'}
                            {subTab === 'receipts' && 'Últimas Notas Fiscais Enviadas'}
                            {subTab === 'users' && 'Usuários Cadastrados'}
                        </h3>
                        <p className="text-[11px] text-app-graytext dark:text-slate-400 mt-0.5">
                            {subTab === 'rewards' && 'Adicione, edite ou remova recompensas do catálogo'}
                            {subTab === 'redemptions' && 'Confirme o protocolo apresentado pelo estudante para liberar o prêmio'}
                            {subTab === 'receipts' && 'Histórico geral de cupons enviados pelos alunos'}
                            {subTab === 'users' && 'Participantes registrados na plataforma'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto">
                        <div className="inline-flex bg-slate-100 dark:bg-[#111827] p-1 rounded-xl border border-slate-200/70 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => {
                                    setSubTab('rewards');
                                    setSearchQuery('');
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
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
                                    setSubTab('redemptions');
                                    setSearchQuery('');
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap ${
                                    subTab === 'redemptions'
                                        ? 'bg-white dark:bg-[#182234] text-app-navy dark:text-white shadow-xs'
                                        : 'text-app-graytext dark:text-slate-400 hover:text-app-navy dark:hover:text-white'
                                }`}
                            >
                                <span>Resgates</span>
                                {pendingRedemptions.length > 0 ? (
                                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-500 text-white">
                                        {pendingRedemptions.length}
                                    </span>
                                ) : (
                                    <span>({redemptions.length})</span>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setSubTab('receipts');
                                    setSearchQuery('');
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
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
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
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
                            className="p-2 rounded-lg text-app-graytext dark:text-slate-400 hover:text-app-navy dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                        >
                            <RefreshCw
                                className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#4bb9a6]' : ''}`}
                            />
                        </button>
                    </div>
                </div>

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
                                    : subTab === 'redemptions'
                                      ? 'Pesquisar pedido por protocolo (ex: RES-4821), aluno ou prêmio...'
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

                {subTab === 'rewards' && (
                    <AdminRewardsList
                        rewards={rewards}
                        filteredRewards={filteredRewards}
                        searchQuery={searchQuery}
                        deletingId={deletingId}
                        onClearSearch={() => setSearchQuery('')}
                        onEditReward={openEditModal}
                        onDeleteReward={handleDeleteReward}
                    />
                )}

                {subTab === 'redemptions' && (
                    <AdminRedemptionsList
                        redemptions={redemptions}
                        filteredRedemptions={filteredRedemptions}
                        searchQuery={searchQuery}
                        onClearSearch={() => setSearchQuery('')}
                        onValidateRedemption={handleValidateRedemption}
                    />
                )}

                {subTab === 'receipts' && (
                    <AdminReceiptsList
                        receipts={receipts}
                        filteredReceipts={filteredReceipts}
                        searchQuery={searchQuery}
                        onClearSearch={() => setSearchQuery('')}
                    />
                )}

                {subTab === 'users' && (
                    <AdminUsersList
                        users={users}
                        filteredUsers={filteredUsers}
                        searchQuery={searchQuery}
                        onClearSearch={() => setSearchQuery('')}
                        onEditUser={openEditUserModal}
                    />
                )}
            </div>

            <RewardFormModal
                isOpen={isModalOpen}
                editingReward={editingReward}
                formName={formName}
                formDescription={formDescription}
                formTag={formTag}
                formCost={formCost}
                formImage={formImage}
                formError={formError}
                isSaving={isSaving}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSaveReward}
                onChangeName={setFormName}
                onChangeDescription={setFormDescription}
                onChangeTag={setFormTag}
                onChangeCost={setFormCost}
                onChangeImage={setFormImage}
            />

            <UserEditModal
                isOpen={isUserModalOpen}
                editingUser={editingUser}
                userFormName={userFormName}
                userFormEmail={userFormEmail}
                userFormNick={userFormNick}
                userFormRole={userFormRole}
                userFormPassword={userFormPassword}
                userFormError={userFormError}
                isSavingUser={isSavingUser}
                onClose={() => setIsUserModalOpen(false)}
                onSubmit={handleSaveUser}
                onChangeName={setUserFormName}
                onChangeEmail={setUserFormEmail}
                onChangeNick={setUserFormNick}
                onChangeRole={setUserFormRole}
                onChangePassword={setUserFormPassword}
            />
        </div>
    );
};

export default AdminSection;
