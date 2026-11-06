import React from 'react';
import { Pencil, Search, Users } from 'lucide-react';
import type { AdminUserData } from '@/types/dashboard';

interface AdminUsersListProps {
    users: AdminUserData[];
    filteredUsers: AdminUserData[];
    searchQuery: string;
    onClearSearch: () => void;
    onEditUser: (user: AdminUserData) => void;
}

export const AdminUsersList: React.FC<AdminUsersListProps> = ({
    users,
    filteredUsers,
    searchQuery,
    onClearSearch,
    onEditUser,
}) => {
    const isUsersEmpty = users.length === 0;
    const isFilteredEmpty = filteredUsers.length === 0;

    if (isUsersEmpty) {
        return (
            <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Users className="w-9 h-9 text-slate-400 dark:text-slate-500 mx-auto mb-2.5" />
                <p className="text-sm font-bold text-app-navy dark:text-slate-300">
                    Nenhum usuário cadastrado
                </p>
            </div>
        );
    }

    if (isFilteredEmpty) {
        return (
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
                    onClick={onClearSearch}
                    className="mt-3 text-xs font-bold text-[#4bb9a6] hover:underline cursor-pointer"
                >
                    Limpar busca
                </button>
            </div>
        );
    }

    return (
        <div className="divide-y divide-slate-200/70 dark:divide-slate-800/80">
            {filteredUsers.map((user) => {
                const isAdminRole = user.role === 'admin';

                return (
                    <div
                        key={user.id}
                        className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                        <div className="flex items-start sm:items-center gap-3.5">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-app-graytext dark:text-slate-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                                <Users className="w-4 h-4" />
                            </div>

                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-extrabold text-app-navy dark:text-white">
                                        {user.name}
                                    </span>
                                    {user.nick && (
                                        <span className="text-xs font-semibold text-[#4bb9a6]">
                                            @{user.nick}
                                        </span>
                                    )}
                                    <span
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                            isAdminRole
                                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25'
                                                : 'bg-slate-100 dark:bg-slate-800 text-app-graytext dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                        }`}
                                    >
                                        {isAdminRole ? 'Admin' : 'Aluno'}
                                    </span>
                                </div>

                                <span className="block text-[11px] text-app-graytext dark:text-slate-400 mt-0.5">
                                    {user.email} · {user.total_receipts}{' '}
                                    {user.total_receipts === 1 ? 'nota enviada' : 'notas enviadas'}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 pl-12 sm:pl-0">
                            <span className="bg-[#4bb9a6]/15 dark:bg-[#112a2e] text-[#4bb9a6] border border-[#4bb9a6]/25 text-[11px] font-extrabold px-3 py-1 rounded-full whitespace-nowrap tabular-nums">
                                {user.current_balance.toLocaleString('pt-BR')} pts
                            </span>

                            <button
                                type="button"
                                onClick={() => onEditUser(user)}
                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-app-graytext dark:text-slate-300 hover:text-app-navy dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Editar usuário"
                                aria-label={`Editar ${user.name}`}
                            >
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
