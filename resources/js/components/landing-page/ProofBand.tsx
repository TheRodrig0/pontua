import React from 'react';

export interface ProofBandProps {
    className?: string;
}

interface StatItem {
    value: string;
    label: string;
    valueColor: string;
}

const stats: StatItem[] = [
    { value: '1:1', label: 'Paridade direta (R$ 1 = 1 ponto)', valueColor: 'text-white' },
    { value: '100%', label: 'Das notas para a APAE', valueColor: 'text-app-coral' },
    { value: 'Até 8h', label: 'AACC com certificado PDF', valueColor: 'text-app-teal' },
    { value: '7 Dias', label: 'Prazo de retirada na Secretaria', valueColor: 'text-app-gold' },
];

const ProofBand: React.FC<ProofBandProps> = ({ className = '' }) => {
    return (
        <section className={`bg-app-navy dark:bg-slate-900 text-white shadow-inner ${className}`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-7 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
                {stats.map((stat) => (
                    <div key={stat.label}>
                        <div className={`text-2xl sm:text-4xl font-extrabold ${stat.valueColor}`}>
                            {stat.value}
                        </div>
                        <div className="text-xs text-white/75 mt-1">
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ProofBand;
