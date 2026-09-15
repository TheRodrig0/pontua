import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import SectionHeader from './SectionHeader';

interface FaqEntry {
    question: string;
    answer: string;
}

const faqList: FaqEntry[] = [
    {
        question: 'Preciso colocar meu CPF na nota fiscal?',
        answer:
            'Não! Você pode pontuar com cupons fiscais com ou sem CPF. Qualquer nota fiscal emitida no estado de São Paulo é válida para o envio.',
    },
    {
        question: 'Como funciona a pontuação?',
        answer:
            'A cada R$ 1,00 em compras registradas na nota fiscal enviada e validada, você recebe 1 ponto no sistema para trocar por horas de atividades complementares ou recompensas.',
    },
    {
        question: 'Como resgato minhas horas AACC?',
        answer:
            'Ao atingir a pontuação necessária, você resgata o benefício e o sistema gera um certificado oficial em PDF com código de autenticidade para avaliação e validação da coordenação.',
    },
    {
        question: 'Onde e quando retiro os prêmios físicos?',
        answer:
            'Os prêmios físicos resgatados (camisetas dos cursos, bonés e brindes) ficam disponíveis para retirada presencial na Secretaria em até 7 dias corridos.',
    },
    {
        question: 'Como a APAE é apoiada?',
        answer:
            'Nós repassamos as notas fiscais recebidas diretamente para a equipe da APAE, permitindo que eles mesmos façam o cadastramento e utilizem os créditos e benefícios da Nota Fiscal Paulista em seus projetos sociais.',
    },
];

const FaqSection: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const handleToggle = (index: number) => {
        const isAlreadyOpen = openIndex === index;

        if (isAlreadyOpen) {
            setOpenIndex(null);
            return;
        }

        setOpenIndex(index);
    };

    return (
        <section id="faq" className="py-14 sm:py-24">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-10">
                <SectionHeader
                    tag="Perguntas frequentes"
                    title="Ficou com alguma dúvida?"
                    tagColor="teal"
                />

                <div className="border-t border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800">
                    {faqList.map((item, index) => {
                        const isOpen = openIndex === index;
                        const AccordionIcon = isOpen ? Minus : Plus;

                        return (
                            <div key={item.question} className="py-4.5">
                                <button
                                    type="button"
                                    onClick={() => handleToggle(index)}
                                    aria-expanded={isOpen}
                                    className="w-full text-left flex items-center justify-between gap-4 cursor-pointer group"
                                >
                                    <span className="text-sm sm:text-base font-bold text-app-navy dark:text-white group-hover:text-app-teal transition-colors">
                                        {item.question}
                                    </span>
                                    <span className="text-app-teal shrink-0 font-bold">
                                        <AccordionIcon size={18} />
                                    </span>
                                </button>

                                {isOpen && (
                                    <p className="mt-3 text-sm text-app-graytext dark:text-gray-300 leading-relaxed pr-6">
                                        {item.answer}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default FaqSection;
