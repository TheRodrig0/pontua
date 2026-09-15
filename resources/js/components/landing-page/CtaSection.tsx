import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

export interface CtaSectionProps {
    registerHref?: string;
    loginHref?: string;
}

const CtaSection: React.FC<CtaSectionProps> = ({
    registerHref = '/register',
    loginHref = '/login',
}) => {
    return (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-14 sm:pb-24">
            <div className="bg-linear-to-br from-app-navy to-slate-900 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-12 relative overflow-hidden shadow-xl border border-slate-700/50">
                <div className="max-w-xl space-y-4">
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                        Bora começar?
                    </h2>

                    <p className="text-base sm:text-lg text-white/85 leading-relaxed font-normal">
                        Cadastre-se de graça em minutos e comece a enviar suas notas fiscais. O resto a gente cuida.
                    </p>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-3">
                        <Link
                            href={registerHref}
                            className="px-7 py-3.5 rounded-xl bg-app-teal hover:brightness-95 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            <span>Criar Conta Grátis</span>
                            <ArrowRight size={16} />
                        </Link>

                        <Link
                            href={loginHref}
                            className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold border border-white/20 transition-colors flex items-center justify-center"
                        >
                            Entrar
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CtaSection;
