import React from 'react';
import SectionHeader from './SectionHeader';

const transparencyItems = [
    {
        stepNumber: '01',
        title: 'É grátis de verdade',
        description:
            'Sem custo, sem mensalidade e sem taxas. Criado por alunos e professores da FATEC em prol da comunidade.',
    },
    {
        stepNumber: '02',
        title: 'Código Aberto (Open Source)',
        description:
            'Transparência total. Nosso software é de código aberto, permitindo que a comunidade acadêmica audite as regras e contribua.',
    },
    {
        stepNumber: '03',
        title: 'Com ou sem CPF',
        description:
            'Qualquer cupom fiscal de compras emitido no estado de São Paulo é válido para pontuar, com ou sem CPF digitado.',
    },
];

const TransparencySection: React.FC = () => {
    return (
        <section
            id="transparencia"
            className="py-14 sm:py-24 bg-app-navy dark:bg-slate-900 text-white"
        >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
                <SectionHeader
                    tag="Transparência"
                    title="Sem pegadinha. Só os fatos."
                    tagColor="teal"
                    titleColor="text-white"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {transparencyItems.map((item) => (
                        <div
                            key={item.stepNumber}
                            className="bg-white/10 border border-white/15 rounded-2xl p-6 space-y-2.5"
                        >
                            <span className="text-app-teal font-bold text-sm">
                                {item.stepNumber}
                            </span>
                            <h3 className="text-lg font-bold text-white">
                                {item.title}
                            </h3>
                            <p className="text-sm text-white/80 leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TransparencySection;
