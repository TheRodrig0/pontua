import React from 'react';
import { GraduationCap, Shirt, Heart, Receipt } from 'lucide-react';
import SectionHeader from './SectionHeader';

const benefits = [
    {
        icon: GraduationCap,
        title: 'Horas AACC',
        description:
            'Troque pontos por certificados oficiais em arquivo PDF com chave autenticadora para avaliação e validação da coordenação.',
        iconBg: 'bg-app-teal/15',
        iconColor: 'text-app-teal',
    },
    {
        icon: Shirt,
        title: 'Prêmios no Campus',
        description:
            'Camisetas oficiais dos cursos, bonés bordados e acessórios FATEC. Retirada em até 7 dias na Secretaria.',
        iconBg: 'bg-app-coral/15',
        iconColor: 'text-app-coral',
    },
    {
        icon: Heart,
        title: 'Doação Gratuita à APAE',
        description:
            'Cada nota enviada apoia diretamente a assistência e os projetos socioeducativos da APAE, sem tirar 1 real do seu bolso.',
        iconBg: 'bg-rose-500/15',
        iconColor: 'text-rose-500',
    },
    {
        icon: Receipt,
        title: 'Repositório de Notas',
        description:
            'Suas notas fiscais ficam guardadas e organizadas no app para consulta rápida, garantia e controle financeiro.',
        iconBg: 'bg-app-navy/10 dark:bg-app-teal/20',
        iconColor: 'text-app-navy dark:text-app-teal',
    },
];

const BenefitsSection: React.FC = () => {
    return (
        <section id="ganha" className="py-14 sm:py-24">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
                <SectionHeader
                    tag="O que você ganha"
                    title="Várias formas de aproveitar — com a mesma nota."
                    tagColor="coral"
                />

                <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-10 shadow-sm border border-slate-200 dark:border-slate-800 space-y-8">
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl sm:text-2xl font-extrabold text-app-navy dark:text-white">
                            Recompensas
                        </h3>
                        <span className="inline-flex items-center gap-1 bg-app-teal/15 text-app-teal text-xs font-bold px-3 py-1 rounded-full">
                            PRA TODOS
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
                        {benefits.map((item) => {
                            const IconComponent = item.icon;

                            return (
                                <div key={item.title} className="flex gap-4 items-start">
                                    <div
                                        className={`w-12 h-12 rounded-xl ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0`}
                                    >
                                        <IconComponent size={22} />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-base font-bold text-app-navy dark:text-white">
                                            {item.title}
                                        </h4>
                                        <p className="text-sm leading-relaxed text-app-graytext dark:text-gray-400">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BenefitsSection;
