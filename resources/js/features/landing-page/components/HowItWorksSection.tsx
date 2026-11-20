import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import LandingSectionHeader from './LandingSectionHeader'

interface StepItem {
    number: string
    title: string
    description: string
}

const HOW_IT_WORKS_STEPS: readonly StepItem[] = [
    {
        number: '01',
        title: 'Peça a nota sem CPF',
        description: 'Escaneie o QR Code direto pelo navegador.',
    },
    {
        number: '02',
        title: 'Apoie a APAE na hora',
        description: 'Envio digital sem urna física, até o dia 20 do mês seguinte à compra.',
    },
    {
        number: '03',
        title: 'Use seus pontos',
        description: 'Troque por horas AACC, itens da FATEC ou mande a amigos.',
    },
]

const HowItWorksSection: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const userPausedRef = useRef(false)
    const [isPlaying, setIsPlaying] = useState(false)

    const playVideo = useCallback(() => {
        const video = videoRef.current
        if (!video) return
        const playPromise = video.play()
        if (playPromise) {
            playPromise.catch(() => {
                setIsPlaying(false)
            })
        }
    }, [])

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !userPausedRef.current) {
                    playVideo()
                } else if (!entry.isIntersecting && !video.paused) {
                    video.pause()
                }
            },
            { threshold: 0.35 },
        )

        observer.observe(video)
        return () => observer.disconnect()
    }, [playVideo])

    const togglePlayback = () => {
        const video = videoRef.current
        if (!video) return
        if (video.paused) {
            userPausedRef.current = false
            playVideo()
        } else {
            userPausedRef.current = true
            video.pause()
        }
    }

    return (
        <section
            id="como-funciona"
            aria-labelledby="how-it-works-heading"
            className="bg-white dark:bg-app-landing-dark py-10 sm:py-12 lg:py-16 scroll-mt-20 sm:scroll-mt-24"
        >
            <div className="w-full lg:max-w-[min(86vw,100rem)] mx-auto px-5 sm:px-8 lg:px-6 space-y-6 lg:space-y-8">
                <LandingSectionHeader
                    id="how-it-works-heading"
                    tag="Como funciona"
                    tone="teal"
                    title={
                        <>
                            Três passos para doar e{' '}
                            <span className="text-app-teal-deep dark:text-app-teal">pontuar.</span>
                        </>
                    }
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                    <ol className="lg:col-span-5 divide-y divide-app-navy/10 dark:divide-white/10 border-y border-app-navy/10 dark:border-white/10 list-none">
                        {HOW_IT_WORKS_STEPS.map((step) => (
                            <li
                                key={step.number}
                                className="py-4 sm:py-5 flex items-baseline gap-4"
                            >
                                <span className="text-sm font-black tabular-nums text-app-teal-deep dark:text-app-teal shrink-0">
                                    {step.number}
                                </span>
                                <div className="min-w-0">
                                    <h3 className="text-sm sm:text-base font-extrabold text-app-navy dark:text-slate-100 leading-snug">
                                        {step.title}
                                    </h3>
                                    <p className="landing-copy text-xs sm:text-sm leading-snug text-slate-600 dark:text-slate-300 mt-0.5 m-0">
                                        {step.description}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ol>

                    <div className="lg:col-span-7">
                        <div className="relative w-full rounded-2xl overflow-hidden bg-white dark:bg-app-receipt-dark border border-app-navy/12 dark:border-white/12 shadow-[0_2px_0_rgba(39,49,66,0.06)] dark:shadow-none">
                            <video
                                ref={videoRef}
                                className="block w-full h-auto aspect-[48/31]"
                                muted
                                loop
                                playsInline
                                preload="metadata"
                                poster="/videos/como-funciona-poster.webp?v=8"
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                aria-label="Animação mostrando os três passos: pedir a nota sem CPF e escanear pelo navegador, enviar o apoio à APAE e acumular pontos para trocar por horas complementares, prêmios ou doação."
                            >
                                <source src="/videos/como-funciona.mp4?v=8" type="video/mp4" />
                                <source src="/videos/como-funciona.webm?v=8" type="video/webm" />
                            </video>

                            <button
                                type="button"
                                onClick={togglePlayback}
                                aria-label={isPlaying ? 'Pausar animação' : 'Reproduzir animação'}
                                className="absolute top-3 right-3 sm:top-4 sm:right-4 inline-flex items-center justify-center min-w-11 min-h-11 p-2.5 rounded-full bg-white/95 text-app-navy border border-app-navy/12 shadow-sm hover:bg-white transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-app-teal-deep focus-visible:outline-offset-2 cursor-pointer"
                            >
                                {isPlaying ? (
                                    <Pause size={18} aria-hidden="true" />
                                ) : (
                                    <Play size={18} aria-hidden="true" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HowItWorksSection
