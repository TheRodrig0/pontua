import React from 'react';
import {
    Sparkles,
    Clock,
    Heart,
    QrCode,
    Camera,
    GraduationCap,
    Leaf,
    Handshake,
    Award,
} from 'lucide-react';

interface AboutApaeSectionProps {
    onOpenScanModal: () => void;
}

const projectPillars = [
    {
        icon: GraduationCap,
        title: 'Educação com Propósito',
        subtitle:
            'Desenvolvido no curso de GTI da Fatec Franco da Rocha unindo prática tecnológica e cidadania.',
        badge: 'ODS 4 · ONU',
        badgeStyle:
            'bg-[#4bb9a6]/15 dark:bg-[#112a2e] text-[#4bb9a6] border border-[#4bb9a6]/25',
    },
    {
        icon: Leaf,
        title: 'Comunidade Sustentável & Sem Papel',
        subtitle:
            'Elimina o transporte semanal da urna física e a triagem manual de notas amassadas na APAE.',
        badge: 'ODS 11 · ONU',
        badgeStyle:
            'bg-[#4bb9a6]/15 dark:bg-[#112a2e] text-[#4bb9a6] border border-[#4bb9a6]/25',
    },
    {
        icon: Handshake,
        title: 'Parceria Ensino Público & Terceiro Setor',
        subtitle:
            'Conecta a Fatec Franco da Rocha à APAE de Caieiras garantindo recursos antes do vencimento.',
        badge: 'ODS 17 · ONU',
        badgeStyle:
            'bg-[#4bb9a6]/15 dark:bg-[#112a2e] text-[#4bb9a6] border border-[#4bb9a6]/25',
    },
    {
        icon: Award,
        title: 'Incentivo Acadêmico Direto',
        subtitle:
            'Cada R$ 1,00 em cupom doado vira 1 ponto para resgatar horas AACC e brindes no campus.',
        badge: '1 Real = 1 Ponto',
        badgeStyle:
            'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25',
    },
];

export const AboutApaeSection: React.FC<AboutApaeSectionProps> = ({
    onOpenScanModal,
}) => {
    return (
        <div className="space-y-6">
            {/* 1. Three KPI Metric Cards (Mesmo padrão da Visão Geral) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Card 1 */}
                <div className="bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-app-graytext dark:text-slate-400">
                            Aprovação Estudantil
                        </span>
                        <Sparkles className="w-4 h-4 text-[#4bb9a6]" />
                    </div>

                    <div className="my-3 flex items-baseline gap-1.5">
                        <span className="text-3xl sm:text-4xl font-extrabold text-app-navy dark:text-white tracking-tight">
                            95%
                        </span>
                        <span className="text-xs font-extrabold text-[#4bb9a6] uppercase tracking-wider">
                            ADESÃO
                        </span>
                    </div>

                    <div className="pt-1">
                        <span className="text-[11px] text-app-graytext dark:text-slate-400">
                            Participam mais com pontos e horas AACC
                        </span>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-app-graytext dark:text-slate-400">
                            Prazo Legal Protegido
                        </span>
                        <Clock className="w-4 h-4 text-[#ea7349]" />
                    </div>

                    <div className="my-3">
                        <span className="text-3xl sm:text-4xl font-extrabold text-app-navy dark:text-white tracking-tight">
                            40 dias
                        </span>
                    </div>

                    <div className="pt-1">
                        <span className="text-[11px] text-app-graytext dark:text-slate-400">
                            Envio digital evita expiração na APAE
                        </span>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-app-graytext dark:text-slate-400">
                            Impacto Social
                        </span>
                        <Heart className="w-4 h-4 text-[#ea7349]" />
                    </div>

                    <div className="my-3">
                        <span className="text-3xl sm:text-4xl font-extrabold text-app-navy dark:text-white tracking-tight">
                            100%
                        </span>
                    </div>

                    <div className="pt-1">
                        <span className="text-[11px] text-app-graytext dark:text-slate-400">
                            Notas destinadas à APAE de Caieiras
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. Banner de Propósito (Mesmo padrão do Banner da Visão Geral) */}
            <div className="bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-start sm:items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#4bb9a6]/15 dark:bg-[#112a2e] border border-[#4bb9a6]/25 dark:border-[#4bb9a6]/20 text-[#4bb9a6] flex items-center justify-center shrink-0">
                        <QrCode className="w-6 h-6" />
                    </div>

                    <div>
                        <h2 className="text-base sm:text-lg font-extrabold text-app-navy dark:text-white tracking-tight">
                            Por que o PONTUA existe?
                        </h2>
                        <p className="text-xs text-app-graytext dark:text-slate-400 mt-0.5 leading-relaxed">
                            Substituímos a antiga urna física da secretaria — onde 84,6% dos alunos esqueciam o papel e a coordenação precisava levar as notas semanalmente até a APAE — pelo envio digital direto.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onOpenScanModal}
                    className="w-full sm:w-auto bg-[#4bb9a6] hover:bg-[#3da392] text-white text-xs font-extrabold uppercase tracking-wider px-5 py-3 rounded-xl inline-flex items-center justify-center gap-2 shadow-md shadow-[#4bb9a6]/20 transition-all cursor-pointer shrink-0"
                >
                    <Camera className="w-4 h-4" />
                    <span>ESCANEAR CUPOM</span>
                </button>
            </div>

            {/* 3. Lista de Valores & Pilares (Mesmo padrão de 'Últimos Cupons Doados' da Visão Geral) */}
            <div className="bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-5">
                    <div>
                        <h3 className="text-base font-extrabold text-app-navy dark:text-white tracking-tight">
                            Valores e Pilares do Projeto
                        </h3>
                        <p className="text-[11px] text-app-graytext dark:text-slate-400 mt-0.5">
                            Fatec Franco da Rocha (GTI) em parceria com a APAE
                        </p>
                    </div>

                    <span className="bg-[#4bb9a6]/15 dark:bg-[#112a2e] text-[#4bb9a6] border border-[#4bb9a6]/25 dark:border-[#4bb9a6]/20 text-[11px] font-bold px-3 py-1 rounded-full">
                        Agenda 2030
                    </span>
                </div>

                <div className="divide-y divide-slate-200/70 dark:divide-slate-800/80">
                    {projectPillars.map((pillar) => {
                        const Icon = pillar.icon;

                        return (
                            <div
                                key={pillar.title}
                                className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                                <div className="flex items-start sm:items-center gap-3.5">
                                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-app-graytext dark:text-slate-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                                        <Icon className="w-4 h-4" />
                                    </div>

                                    <div>
                                        <span className="block text-sm font-extrabold text-app-navy dark:text-white">
                                            {pillar.title}
                                        </span>
                                        <span className="block text-[11px] text-app-graytext dark:text-slate-400 mt-0.5">
                                            {pillar.subtitle}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end pl-12 sm:pl-0">
                                    <span
                                        className={`${pillar.badgeStyle} text-[11px] font-extrabold px-3 py-1 rounded-full whitespace-nowrap`}
                                    >
                                        {pillar.badge}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AboutApaeSection;
