import React from 'react'

export interface LandingSectionHeaderProps {
    id: string
    tag: string
    title: React.ReactNode
    tone?: 'teal' | 'coral' | 'navy'
}

const LandingSectionHeader: React.FC<LandingSectionHeaderProps> = ({
    id,
    tag,
    title,
}) => {
    return (
        <div className="max-w-2xl space-y-2">
            <span className="block text-xs font-extrabold text-app-teal-deep dark:text-app-teal">
                {tag}
            </span>

            <h2
                id={id}
                className="landing-heading text-left text-[1.625rem] sm:text-4xl font-black tracking-tight leading-[1.14] text-app-navy dark:text-slate-100"
            >
                {title}
            </h2>
        </div>
    )
}

export default LandingSectionHeader
