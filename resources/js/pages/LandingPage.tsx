import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/landing-page/HeroSection';
import ProofBand from '@/components/landing-page/ProofBand';
import HowItWorksSection from '@/components/landing-page/HowItWorksSection';
import BenefitsSection from '@/components/landing-page/BenefitsSection';
import TransparencySection from '@/components/landing-page/TransparencySection';
import FaqSection from '@/components/landing-page/FaqSection';
import CtaSection from '@/components/landing-page/CtaSection';

const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col w-full overflow-x-hidden text-app-navy dark:text-gray-100 transition-colors">
            <Header />

            <main className="flex-1">
                <HeroSection />
                <ProofBand />
                <HowItWorksSection />
                <BenefitsSection />
                <TransparencySection />
                <FaqSection />
                <CtaSection />
            </main>

            <Footer />
        </div>
    );
};

export default LandingPage;
