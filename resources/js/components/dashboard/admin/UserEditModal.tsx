import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import ModalDialog from '@/components/ui/ModalDialog';
import type { AdminUserData } from '@/types/dashboard';

interface UserEditModalProps {
    isOpen: boolean;
    editingUser: AdminUserData | null;
    isSelf?: boolean;
    userFormName: string;
    userFormEmail: string;
    userFormNick: string;
    userFormRole: 'user' | 'admin';
    userFormPassword: string;
    userFormError: string | null;
    isSavingUser: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onChangeName: (value: string) => void;
    onChangeEmail: (value: string) => void;
    onChangeNick: (value: string) => void;
    onChangeRole: (value: 'user' | 'admin') => void;
    onChangePassword: (value: string) => void;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({
    isOpen,
    editingUser,
    isSelf,
    userFormName,
    userFormEmail,
    userFormNick,
    userFormRole,
    userFormPassword,
    userFormError,
    isSavingUser,
    onClose,
    onSubmit,
    onChangeName,
    onChangeEmail,
    onChangeNick,
    onChangeRole,
    onChangePassword,
}) => {
    return (
        <ModalDialog
            isOpen={isOpen}
            onClose={onClose}
            title="Editar Usuário"
            subtitle={`Atualize as informações cadastrais e permissões de ${editingUser?.name || 'usuário'}.`}
        >
            <form onSubmit={onSubmit} className="space-y-4">
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
                        onChange={(e) => onChangeName(e.target.value)}
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
                                onChange={(e) => onChangeNick(e.target.value.replace(/^@/, ''))}
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
                            disabled={isSelf}
                            onChange={(e) => onChangeRole(e.target.value as 'user' | 'admin')}
                            className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-app-navy dark:text-white focus:outline-none focus:border-[#4bb9a6] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <option value="user">Aluno (Padrão)</option>
                            <option value="admin">Administrador</option>
                        </select>
                        {isSelf && (
                            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                                Você não pode remover o privilégio de administrador da sua própria conta.
                            </p>
                        )}
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
                        onChange={(e) => onChangeEmail(e.target.value)}
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
                        onChange={(e) => onChangePassword(e.target.value)}
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
                        onClick={onClose}
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
    );
};
