import React from 'react'

export const ArrowRightIcon: React.FC<{ size?: number; className?: string }> = ({
    size = 15,
    className = 'transition-transform duration-200 group-hover:translate-x-[3px]',
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
    >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </svg>
)

export const HeartIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 21s-7-4.35-9.5-8.5C.3 8.9 2.4 4.5 6.5 4.5c2.1 0 4 1.1 5.5 2.8C13.5 5.6 15.4 4.5 17.5 4.5c4.1 0 6.2 4.4 4 8-2.5 4.15-9.5 8.5-9.5 8.5z" />
    </svg>
)

export const StarIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z" />
    </svg>
)

export const QrCodeGraphic: React.FC<{
    className?: string
    cornersClassName?: string
    modulesClassName?: string
}> = ({
    className = 'w-[72px] h-[72px] sm:w-[92px] sm:h-[92px] block',
    cornersClassName = '',
    modulesClassName = 'fill-app-navy dark:fill-slate-300 transition-colors duration-200',
}) => (
    <svg className={className} viewBox="-4 -4 29 29" fill="none" aria-hidden="true">
        <path
            className={cornersClassName}
            d="M-2.2 2.5V-1.2C-2.2-1.75-1.75-2.2-1.2-2.2H2.5M18.5-2.2H22.2C22.75-2.2 23.2-1.75 23.2-1.2V2.5M23.2 18.5V22.2C23.2 22.75 22.75 23.2 22.2 23.2H18.5M2.5 23.2H-1.2C-1.75 23.2-2.2 22.75-2.2 22.2V18.5"
            stroke="#4bb9a6"
            strokeWidth="1.05"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            className={modulesClassName}
            d="M0 0h1v1h-1zM1 0h1v1h-1zM2 0h1v1h-1zM3 0h1v1h-1zM4 0h1v1h-1zM5 0h1v1h-1zM6 0h1v1h-1zM8 0h1v1h-1zM10 0h1v1h-1zM14 0h1v1h-1zM15 0h1v1h-1zM16 0h1v1h-1zM17 0h1v1h-1zM18 0h1v1h-1zM19 0h1v1h-1zM20 0h1v1h-1zM0 1h1v1h-1zM6 1h1v1h-1zM9 1h1v1h-1zM12 1h1v1h-1zM14 1h1v1h-1zM20 1h1v1h-1zM0 2h1v1h-1zM2 2h1v1h-1zM3 2h1v1h-1zM4 2h1v1h-1zM6 2h1v1h-1zM11 2h1v1h-1zM14 2h1v1h-1zM16 2h1v1h-1zM17 2h1v1h-1zM18 2h1v1h-1zM20 2h1v1h-1zM0 3h1v1h-1zM2 3h1v1h-1zM3 3h1v1h-1zM4 3h1v1h-1zM6 3h1v1h-1zM8 3h1v1h-1zM10 3h1v1h-1zM12 3h1v1h-1zM14 3h1v1h-1zM16 3h1v1h-1zM17 3h1v1h-1zM18 3h1v1h-1zM20 3h1v1h-1zM0 4h1v1h-1zM2 4h1v1h-1zM3 4h1v1h-1zM4 4h1v1h-1zM6 4h1v1h-1zM9 4h1v1h-1zM14 4h1v1h-1zM16 4h1v1h-1zM17 4h1v1h-1zM18 4h1v1h-1zM20 4h1v1h-1zM0 5h1v1h-1zM6 5h1v1h-1zM8 5h1v1h-1zM11 5h1v1h-1zM14 5h1v1h-1zM20 5h1v1h-1zM0 6h1v1h-1zM1 6h1v1h-1zM2 6h1v1h-1zM3 6h1v1h-1zM4 6h1v1h-1zM5 6h1v1h-1zM6 6h1v1h-1zM8 6h1v1h-1zM10 6h1v1h-1zM12 6h1v1h-1zM14 6h1v1h-1zM15 6h1v1h-1zM16 6h1v1h-1zM17 6h1v1h-1zM18 6h1v1h-1zM19 6h1v1h-1zM20 6h1v1h-1zM0 8h1v1h-1zM2 8h1v1h-1zM4 8h1v1h-1zM6 8h1v1h-1zM8 8h1v1h-1zM11 8h1v1h-1zM14 8h1v1h-1zM16 8h1v1h-1zM19 8h1v1h-1zM1 9h1v1h-1zM5 9h1v1h-1zM9 9h1v1h-1zM12 9h1v1h-1zM17 9h1v1h-1zM20 9h1v1h-1zM3 10h1v1h-1zM5 10h1v1h-1zM6 10h1v1h-1zM8 10h1v1h-1zM10 10h1v1h-1zM13 10h1v1h-1zM15 10h1v1h-1zM18 10h1v1h-1zM0 11h1v1h-1zM1 11h1v1h-1zM4 11h1v1h-1zM12 11h1v1h-1zM16 11h1v1h-1zM20 11h1v1h-1zM2 12h1v1h-1zM6 12h1v1h-1zM9 12h1v1h-1zM11 12h1v1h-1zM13 12h1v1h-1zM16 12h1v1h-1zM19 12h1v1h-1zM8 13h1v1h-1zM14 13h1v1h-1zM17 13h1v1h-1zM20 13h1v1h-1zM0 14h1v1h-1zM1 14h1v1h-1zM2 14h1v1h-1zM3 14h1v1h-1zM4 14h1v1h-1zM5 14h1v1h-1zM6 14h1v1h-1zM8 14h1v1h-1zM10 14h1v1h-1zM12 14h1v1h-1zM15 14h1v1h-1zM18 14h1v1h-1zM0 15h1v1h-1zM6 15h1v1h-1zM11 15h1v1h-1zM17 15h1v1h-1zM20 15h1v1h-1zM0 16h1v1h-1zM2 16h1v1h-1zM3 16h1v1h-1zM4 16h1v1h-1zM6 16h1v1h-1zM9 16h1v1h-1zM13 16h1v1h-1zM14 16h1v1h-1zM16 16h1v1h-1zM19 16h1v1h-1zM0 17h1v1h-1zM2 17h1v1h-1zM3 17h1v1h-1zM4 17h1v1h-1zM6 17h1v1h-1zM10 17h1v1h-1zM15 17h1v1h-1zM18 17h1v1h-1zM0 18h1v1h-1zM2 18h1v1h-1zM3 18h1v1h-1zM4 18h1v1h-1zM6 18h1v1h-1zM8 18h1v1h-1zM12 18h1v1h-1zM14 18h1v1h-1zM16 18h1v1h-1zM19 18h1v1h-1zM20 18h1v1h-1zM0 19h1v1h-1zM6 19h1v1h-1zM11 19h1v1h-1zM17 19h1v1h-1zM18 19h1v1h-1zM0 20h1v1h-1zM1 20h1v1h-1zM2 20h1v1h-1zM3 20h1v1h-1zM4 20h1v1h-1zM5 20h1v1h-1zM6 20h1v1h-1zM8 20h1v1h-1zM9 20h1v1h-1zM13 20h1v1h-1zM15 20h1v1h-1zM17 20h1v1h-1zM20 20h1v1h-1z"
        />
    </svg>
)

export interface ReceiptZigzagEdgeProps {
    className?: string
    fillClassName?: string
}

export const ReceiptZigzagEdge: React.FC<ReceiptZigzagEdgeProps> = ({
    className = 'absolute -left-px -right-px top-[calc(100%-1px)] h-[11px] w-[calc(100%+2px)] block',
    fillClassName = 'fill-[#f8fafc] dark:fill-app-receipt-dark transition-[fill] duration-200',
}) => (
    <svg className={className} viewBox="0 0 260 11" preserveAspectRatio="none" aria-hidden="true">
        <polygon
            className={fillClassName}
            points="0,0 260,0 260,1 247,11 234,1 221,11 208,1 195,11 182,1 169,11 156,1 143,11 130,1 117,11 104,1 91,11 78,1 65,11 52,1 39,11 26,1 13,11 0,1"
        />
    </svg>
)
