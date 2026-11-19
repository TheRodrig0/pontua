import React, { Suspense, lazy } from 'react'
import { Head } from '@inertiajs/react'
import Header from '@/components/layout/Header'
import HeroSection from '@/features/landing-page/components/HeroSection'

const HowItWorksSection = lazy(() => import('@/features/landing-page/components/HowItWorksSection'))
const BenefitsShowcaseSection = lazy(() => import('@/features/landing-page/components/BenefitsShowcaseSection'))
const ImpactFaqSection = lazy(() => import('@/features/landing-page/components/ImpactFaqSection'))
const LandingContentSection = lazy(() => import('@/features/landing-page/components/LandingContentSection'))
const Footer = lazy(() => import('@/components/layout/Footer'))

const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col w-full bg-white dark:bg-app-landing-dark text-app-navy dark:text-slate-200 transition-colors duration-200">
            <Head title="Início" />

            <Header />

            <main className="flex-1 overflow-x-clip">
                <HeroSection />
                <Suspense fallback={null}>
                    <HowItWorksSection />
                    <BenefitsShowcaseSection />
                    <ImpactFaqSection />
                    <LandingContentSection />
                </Suspense>
            </main>

            <Suspense fallback={null}>
                <Footer />
            </Suspense>
        </div>
    )
}

export default LandingPage
