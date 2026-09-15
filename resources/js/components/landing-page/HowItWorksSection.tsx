import React from 'react';
import SectionHeader from './SectionHeader';

const steps = [
    {
        step: '01',
        title: 'Guarde a nota fiscal',
        description: 'No caixa do mercado, padaria, cantina ou farmácia. Com ou sem CPF na nota.',
        numberColor: 'text-app-teal',
    },
    {
        step: '02',
        title: 'Envie pelo seu dispositivo',
        description: 'Aponte a câmera para o QR Code impresso no cupom ou envie o arquivo da nota. O envio é instantâneo.',
        numberColor: 'text-app-teal',
    },
    {
        step: '03',
        title: 'A gente valida',
        description: 'O sistema processa a nota e destina o apoio diretamente para os projetos da APAE.',
        numberColor: 'text-app-teal',
    },
    {
        step: '04',
        title: 'Você recebe',
        description: 'Cada R$ 1,00 vira 1 ponto para resgatar horas AACC ou prêmios no campus.',
        numberColor: 'text-app-coral',
    },
];

const HowItWorksSection: React.FC = () => {
    return (
        <section
            id="como-funciona"
            className="py-14 sm:py-24 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800"
        >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
                <SectionHeader
                    tag="Como funciona"
                    title="Você não muda a rotina. Só guarda o cupom fiscal."
                    tagColor="teal"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-slate-200 dark:border-slate-800 pt-8">
                    {steps.map((item, index) => {
                        const isLast = index === steps.length - 1;
                        const borderClass = isLast
                            ? 'py-4 lg:pl-6'
                            : 'py-4 pr-6 lg:px-6 lg:border-r border-b lg:border-b-0 border-slate-200 dark:border-slate-800';

                        return (
                            <div key={item.step} className={`${borderClass} space-y-3`}>
                                <div className={`text-5xl font-black ${item.numberColor} leading-none`}>
                                    {item.step}
                                </div>

                                <h3 className="text-lg font-bold text-app-navy dark:text-white">
                                    {item.title}
                                </h3>

                                <p className="text-sm leading-relaxed text-app-graytext dark:text-gray-400">
                                    {item.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default HowItWorksSection;
