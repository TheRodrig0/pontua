let activeRafId: number | null = null

const easeOutExpo = (t: number): number => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))

export const animateScrollTo = (targetY: number, duration = 560): void => {
    if (typeof window === 'undefined') return

    if (activeRafId !== null) {
        window.cancelAnimationFrame(activeRafId)
        activeRafId = null
    }

    const startY = window.scrollY
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    const clampedTarget = Math.min(Math.max(0, targetY), maxScroll)
    const delta = clampedTarget - startY

    if (Math.abs(delta) < 2) {
        window.scrollTo(0, clampedTarget)
        return
    }

    const startTime = performance.now()

    const step = (now: number) => {
        const elapsed = now - startTime
        const progress = Math.min(1, elapsed / duration)
        const eased = easeOutExpo(progress)

        window.scrollTo(0, Math.round(startY + delta * eased))

        if (progress < 1) {
            activeRafId = window.requestAnimationFrame(step)
        } else {
            activeRafId = null
        }
    }

    activeRafId = window.requestAnimationFrame(step)
}

export const smoothScrollToHash = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    onAfterTrigger?: () => void,
): void => {
    if (typeof window === 'undefined' || !href.startsWith('#')) return

    const id = href.slice(1)
    const target = document.getElementById(id)
    if (!target) return

    e.preventDefault()
    onAfterTrigger?.()

    const headerEl = document.querySelector('header')
    const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 72
    const rect = target.getBoundingClientRect()
    const targetY = rect.top + window.scrollY - headerHeight

    window.history.pushState(null, '', href)
    animateScrollTo(targetY)
}

export const smoothScrollToTopIfHome = (
    e: React.MouseEvent<Element>,
    onAfterTrigger?: () => void,
): void => {
    if (typeof window === 'undefined') return

    if (window.location.pathname === '/') {
        e.preventDefault()
        onAfterTrigger?.()
        if (window.location.hash) {
            window.history.pushState(null, '', '/')
        }
        animateScrollTo(0)
    } else {
        onAfterTrigger?.()
    }
}
