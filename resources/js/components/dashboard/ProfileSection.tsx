import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import {
    User,
    AtSign,
    Mail,
    Sparkles,
    Flame,
    ReceiptText,
    Trophy,
    Trash2,
    Lock,
    Loader2,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';
import { apiRequest, setAuthToken } from '@/lib/api';
import type { UserProfile } from '@/types/dashboard';

interface ProfileSectionProps {
    profile: UserProfile | null;
    onProfileUpdated: (updated: UserProfile) => void;
}

const AVATAR_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function getInitials(name?: string): string {
    if (!name || !name.trim()) {
        return 'AL';
    }
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
    profile,
    onProfileUpdated,
}) => {
    const [name, setName] = useState('');
    const [nick, setNick] = useState('');
    const [selectedAvatarId, setSelectedAvatarId] = useState<number | null>(null);
    const [avatarLoadError, setAvatarLoadError] = useState(false);

    const [isUpdating, setIsUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Delete account state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (profile) {
            setName(profile.name || '');
            setNick(profile.nick || '');
            setAvatarLoadError(false);

            const match = profile.avatar_url?.match(/avatars\/(\d+)\.png/);
            setSelectedAvatarId(match ? parseInt(match[1], 10) : null);
        }
    }, [profile]);

    const handleUpdateSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage(null);
        setUpdateMessage(null);

        const payload: Record<string, unknown> = {};
        if (name.trim()) {
            payload.name = name.trim();
        }
        if (nick.trim()) {
            payload.nick = nick.trim();
        }
        if (selectedAvatarId !== null) {
            payload.avatar_id = selectedAvatarId;
        }

        setIsUpdating(true);
        try {
            const updated = await apiRequest<UserProfile>('/api/me', {
                method: 'PATCH',
                body: JSON.stringify(payload),
            });

            setUpdateMessage('Perfil atualizado com sucesso!');
            onProfileUpdated({
                ...(profile as UserProfile),
                ...updated,
            });
        } catch (error: any) {
            setErrorMessage(
                error.message || 'Não foi possível atualizar seu perfil.'
            );
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteAccount = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!deletePassword) {
            setErrorMessage('Digite sua senha atual para confirmar a exclusão da conta.');
            return;
        }

        setIsDeleting(true);
        try {
            await apiRequest<{ message: string }>('/api/me', {
                method: 'DELETE',
                body: JSON.stringify({
                    password: deletePassword,
                }),
            });

            setAuthToken(null);
            router.visit('/');
        } catch (error: any) {
            setErrorMessage(
                error.message || 'Senha incorreta ou falha ao excluir a conta.'
            );
        } finally {
            setIsDeleting(false);
        }
    };

    const displayName = profile?.name || 'Aluno FATEC';
    const currentBalance = profile?.current_balance ?? 0;
    const totalReceipts = profile?.total_receipts ?? 0;
    const scanStreak = profile?.scan_streak ?? 0;
    const longestStreak = profile?.longest_streak ?? 0;
    const activeAvatarUrl =
        selectedAvatarId !== null
            ? `/avatars/${selectedAvatarId}.png`
            : profile?.avatar_url || null;

    return (
        <div className="space-y-6">
            {/* 1. Resumo do Perfil (GET /api/me) */}
            <div className="bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        {activeAvatarUrl && !avatarLoadError ? (
                            <img
                                src={activeAvatarUrl}
                                alt={displayName}
                                onError={() => setAvatarLoadError(true)}
                                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#4bb9a6]/40 shrink-0 shadow-sm"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-2xl bg-[#10b981] text-white font-black text-xl flex items-center justify-center shrink-0 shadow-sm">
                                {getInitials(displayName)}
                            </div>
                        )}

                        <div className="min-w-0">
                            <h2 className="text-lg sm:text-xl font-extrabold text-app-navy dark:text-white tracking-tight truncate">
                                {displayName}
                            </h2>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-app-graytext dark:text-slate-400">
                                <span className="inline-flex items-center gap-1 font-semibold text-[#4bb9a6]">
                                    <AtSign className="w-3.5 h-3.5" />
                                    {profile?.nick || 'sem-nickname'}
                                </span>
                                {profile?.email && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5" />
                                        {profile.email}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-xl px-3.5 py-2.5">
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-app-graytext dark:text-slate-400">
                                <Sparkles className="w-3 h-3 text-[#4bb9a6]" />
                                Saldo
                            </span>
                            <span className="block text-sm font-extrabold text-app-navy dark:text-white mt-0.5">
                                {currentBalance.toLocaleString('pt-BR')} pts
                            </span>
                        </div>

                        <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-xl px-3.5 py-2.5">
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-app-graytext dark:text-slate-400">
                                <ReceiptText className="w-3 h-3 text-[#4bb9a6]" />
                                Notas
                            </span>
                            <span className="block text-sm font-extrabold text-app-navy dark:text-white mt-0.5">
                                {totalReceipts} aprovadas
                            </span>
                        </div>

                        <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-xl px-3.5 py-2.5">
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-app-graytext dark:text-slate-400">
                                <Flame className="w-3 h-3 text-[#ea7349]" />
                                Sequência
                            </span>
                            <span className="block text-sm font-extrabold text-app-navy dark:text-white mt-0.5">
                                {scanStreak} {scanStreak === 1 ? 'dia' : 'dias'}
                            </span>
                        </div>

                        <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-xl px-3.5 py-2.5">
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-app-graytext dark:text-slate-400">
                                <Trophy className="w-3 h-3 text-amber-500" />
                                Recorde
                            </span>
                            <span className="block text-sm font-extrabold text-app-navy dark:text-white mt-0.5">
                                {longestStreak} {longestStreak === 1 ? 'dia' : 'dias'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Formulário de Edição (PATCH /api/me) */}
            <div className="bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-6 shadow-sm">
                <div className="mb-5">
                    <h3 className="text-base font-extrabold text-app-navy dark:text-white tracking-tight">
                        Editar Dados do Perfil
                    </h3>
                    <p className="text-xs text-app-graytext dark:text-slate-400 mt-0.5">
                        Atualize seu nome de exibição, nickname no ranking e avatar.
                    </p>
                </div>

                {errorMessage && (
                    <div
                        role="alert"
                        className="mb-4 bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 rounded-xl p-3.5 text-xs flex items-start gap-2.5"
                    >
                        <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                {updateMessage && (
                    <div
                        role="status"
                        aria-live="polite"
                        className="mb-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 rounded-xl p-3.5 text-xs flex items-start gap-2.5"
                    >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{updateMessage}</span>
                    </div>
                )}

                <form onSubmit={handleUpdateSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 focus-within:border-[#4bb9a6]">
                            <label
                                htmlFor="profile-name"
                                className="block text-[10px] font-extrabold uppercase tracking-wider text-app-graytext dark:text-slate-400 mb-1.5"
                            >
                                Nome Completo
                            </label>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-app-graytext dark:text-slate-400 shrink-0" />
                                <input
                                    id="profile-name"
                                    type="text"
                                    autoComplete="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-transparent text-xs sm:text-sm font-semibold text-app-navy dark:text-white focus:outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 focus-within:border-[#4bb9a6]">
                            <label
                                htmlFor="profile-nick"
                                className="block text-[10px] font-extrabold uppercase tracking-wider text-app-graytext dark:text-slate-400 mb-1.5"
                            >
                                Nickname no Ranking (@usuario)
                            </label>
                            <div className="flex items-center gap-2">
                                <AtSign className="w-4 h-4 text-[#4bb9a6] shrink-0" />
                                <input
                                    id="profile-nick"
                                    type="text"
                                    autoComplete="username"
                                    value={nick}
                                    onChange={(e) => setNick(e.target.value)}
                                    placeholder="seu.nickname"
                                    className="w-full bg-transparent text-xs sm:text-sm font-semibold text-app-navy dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Avatar Selector (1..10) with real server images */}
                    <div>
                        <span className="block text-[10px] font-extrabold uppercase tracking-wider text-app-graytext dark:text-slate-400 mb-2.5">
                            Escolher Avatar
                        </span>
                        <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                            {AVATAR_IDS.map((id) => {
                                const isSelected = selectedAvatarId === id;
                                return (
                                    <button
                                        key={id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedAvatarId(id);
                                            setAvatarLoadError(false);
                                        }}
                                        aria-label={`Selecionar avatar ${id}`}
                                        aria-pressed={isSelected}
                                        className={`relative group rounded-2xl p-1 border-2 transition-all cursor-pointer flex items-center justify-center ${
                                            isSelected
                                                ? 'border-[#4bb9a6] bg-[#4bb9a6]/15 dark:bg-[#112a2e] ring-2 ring-[#4bb9a6]/30 scale-105'
                                                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111827] hover:border-slate-300 dark:hover:border-slate-600 hover:scale-105'
                                        }`}
                                    >
                                        <img
                                            src={`/avatars/${id}.png`}
                                            alt={`Avatar ${id}`}
                                            className="w-full aspect-square rounded-xl object-cover"
                                        />
                                        {isSelected && (
                                            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#4bb9a6] text-white flex items-center justify-center shadow-sm">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="bg-[#4bb9a6] hover:bg-[#3da392] disabled:opacity-60 text-white text-xs font-extrabold uppercase tracking-wider px-5 py-3 rounded-xl inline-flex items-center gap-2 shadow-md shadow-[#4bb9a6]/20 transition-all cursor-pointer"
                        >
                            {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                            <span>{isUpdating ? 'Salvando...' : 'Salvar Alterações'}</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* 3. Exclusão de Conta (DELETE /api/me) */}
            <div className="bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-sm font-extrabold text-rose-500 dark:text-rose-400">
                            Zona de Perigo
                        </h3>
                        <p className="text-xs text-app-graytext dark:text-slate-400 mt-0.5">
                            A exclusão da conta remove permanentemente seu acesso e histórico.
                        </p>
                    </div>

                    {!showDeleteConfirm && (
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="self-start sm:self-auto bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-extrabold px-4 py-2.5 rounded-xl inline-flex items-center gap-2 transition-colors cursor-pointer shrink-0"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Excluir minha conta</span>
                        </button>
                    )}
                </div>

                {showDeleteConfirm && (
                    <form
                        onSubmit={handleDeleteAccount}
                        className="mt-4 bg-rose-500/10 dark:bg-rose-950/30 border border-rose-500/30 rounded-xl p-4 space-y-3"
                    >
                        <label
                            htmlFor="delete-account-password"
                            className="block text-xs font-bold text-rose-600 dark:text-rose-300"
                        >
                            Confirme sua senha atual para excluir definitivamente sua conta:
                        </label>

                        <div className="bg-white dark:bg-[#111827] border border-rose-500/40 rounded-xl px-3.5 py-2.5 flex items-center gap-2 max-w-md">
                            <Lock className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
                            <input
                                id="delete-account-password"
                                type="password"
                                autoComplete="current-password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                placeholder="Sua senha atual"
                                className="w-full bg-transparent text-xs text-app-navy dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
                                required
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setDeletePassword('');
                                }}
                                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-app-graytext dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isDeleting}
                                className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold px-4 py-2 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                            >
                                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                <span>Confirmar Exclusão</span>
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ProfileSection;
