import React from 'react';
import LogoPontua from './LogoPontua';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto bg-slate-900 dark:bg-slate-950 text-white/80 py-10 text-xs">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
                <div className="border-b border-white/10 pb-6">
                    <LogoPontua
                        iconSize={28}
                        textClassName="text-base font-extrabold text-white"
                    />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-white/50 text-xs">
                    <p>© {currentYear} PONTUA • 1 Real na nota = 1 Ponto na FATEC • Código Aberto • Apoio direto à APAE.</p>
                    <p>Retirada presencial de prêmios físicos: até 7 dias corridos na Secretaria.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;