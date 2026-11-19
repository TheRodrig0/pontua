import React from 'react'
import { ChevronDown } from 'lucide-react'
import LandingSectionHeader from './LandingSectionHeader'

interface FaqItem {
    question: string
    answer: string
}

const FAQ_ITEMS: readonly FaqItem[] = [
    {
        question: 'Quais notas são aceitas e qual é o prazo de envio?',
        answer: 'Cupons fiscais paulistas (NFC-e de São Paulo) sem CPF, a partir de R$ 1,00, enviados até o dia 20 do mês seguinte à compra.',
    },
    {
        question: 'Como a APAE recebe as notas que eu envio?',
        answer: 'Os cupons validados são reunidos em remessas digitais e repassados diretamente à equipe da APAE antes do vencimento.',
    },
    {
        question: 'Como funciona a entrega das horas AACC na FATEC?',
        answer: 'Ao resgatar horas AACC na plataforma, você gera o certificado em PDF com código do voucher para imprimir e entregar na faculdade.',
    },
    {
        question: 'Onde retiro os itens físicos da loja da unidade?',
        answer: 'Depois de resgatar, basta apresentar o código do seu voucher na secretaria da unidade para retirar o item.',
    },
    {
        question: 'Quem não é aluno da FATEC também pode doar?',
        answer: 'Sim. Qualquer pessoa pode cadastrar cupons para apoiar a APAE e ainda transferir seus pontos para algum estudante da FATEC.',
    },
]

const ImpactFaqSection: React.FC = () => {
    const handleToggle = (event: React.SyntheticEvent<HTMLDetailsElement>) => {
        const current = event.currentTarget
        if (!current.open || Object.hasOwn(HTMLDetailsElement.prototype, 'name')) {
            return
        }

        const container = current.parentElement
        if (!container) return

        for (const sibling of container.querySelectorAll<HTMLDetailsElement>('details[name="landing-faq"]')) {
            if (sibling !== current) {
                sibling.open = false
            }
        }
    }

    return (
        <section
            id="duvidas"
            aria-labelledby="faq-heading"
            className="bg-white dark:bg-app-landing-dark py-10 sm:py-12 lg:py-16 scroll-mt-20 sm:scroll-mt-24 transition-colors duration-200"
        >
            <div className="w-full lg:max-w-[min(86vw,100rem)] mx-auto px-5 sm:px-8 lg:px-6 space-y-6 lg:space-y-8">
                <LandingSectionHeader
                    id="faq-heading"
                    tag="Dúvidas"
                    tone="navy"
                    title="Perguntas frequentes."
                />

                <div className="pb-[75px] sm:pb-[65px] has-[details[open]]:pb-0 motion-safe:transition-[padding-bottom] motion-safe:duration-[240ms] motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]">
                    <div className="faq-accordion divide-y divide-app-navy/10 dark:divide-white/10 border-y border-app-navy/10 dark:border-white/10">
                        {FAQ_ITEMS.map((item) => (
                            <details
                                key={item.question}
                                name="landing-faq"
                                onToggle={handleToggle}
                                className="overflow-hidden"
                            >
                                <summary className="py-4 sm:py-5 min-h-12 flex items-center gap-3 cursor-pointer text-sm sm:text-base font-extrabold text-app-navy dark:text-slate-100 hover:text-app-teal-deep dark:hover:text-app-teal transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-app-teal-deep dark:focus-visible:outline-app-teal focus-visible:outline-offset-[-2px]">
                                    <ChevronDown
                                        className="faq-chevron w-4 h-4 text-app-teal-deep dark:text-app-teal shrink-0"
                                        aria-hidden="true"
                                    />
                                    <span>{item.question}</span>
                                </summary>

                                <div className="pb-4 sm:pb-5 pl-7 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 max-w-3xl">
                                    <p className="landing-copy m-0">{item.answer}</p>
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ImpactFaqSection
